# PLAN DE SEGURIDAD - WorkHoops
## Código Completo para Cerrar Vulnerabilidades Críticas

---

# A) CAMBIOS EN PRISMA SCHEMA + MIGRACIÓN

## A.1 Editar prisma/schema.prisma

Añadir estos campos al modelo User (después de `image`):

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  
  // ========== NUEVOS CAMPOS DE SEGURIDAD ==========
  passwordHash       String?    // Hash bcrypt del password
  passwordUpdatedAt  DateTime?  // Última actualización de password
  failedLoginAttempts Int       @default(0)  // Intentos fallidos
  lockedUntil        DateTime?  // Bloqueo temporal por intentos fallidos
  // ================================================
  
  role          UserRole  @default(jugador)
  locale        String    @default("es")
  verified      Boolean   @default(false)
  
  // ... resto del modelo igual
}
```

## A.2 Comando para aplicar cambios

```bash
# Opción 1: Si usas db push (desarrollo rápido sin migraciones)
npx prisma db push

# Opción 2: Si quieres migraciones versionadas (recomendado para producción)
npx prisma migrate dev --name add_password_security_fields
npx prisma generate

# Para producción (Vercel/deploy)
npx prisma migrate deploy
```

## A.3 Script SQL de transición (ejecutar en Supabase SQL Editor)

```sql
-- Script de transición: usuarios sin passwordHash
-- Opción 1: Marcar usuarios existentes para reset obligatorio
-- (No pueden loguearse hasta que reseteen su password)

-- Añadir columnas si no existen (Supabase)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordUpdatedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP;

-- Verificar usuarios sin passwordHash (para auditoría)
SELECT id, email, name, role, "createdAt" 
FROM users 
WHERE "passwordHash" IS NULL;

-- IMPORTANTE: Estos usuarios NO podrán loguearse hasta:
-- 1. Implementar flujo "Olvidé mi contraseña"
-- 2. O enviarles email de reset manual
-- 3. O ejecutar un script que les asigne un password temporal hasheado
```

---

# B) FIX REGISTER

## Archivo: app/api/auth/register/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255).toLowerCase(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres') // límite bcrypt
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  role: z.enum(['jugador', 'entrenador', 'club']).default('jugador'),
})

export async function POST(request: NextRequest) {
  try {
    // ========== RATE LIMITING ==========
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000) // 5 registros por minuto

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: 'Demasiados intentos. Espera un minuto.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.getTime().toString(),
          }
        }
      )
    }

    // ========== VALIDACIÓN ==========
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validation.data

    // ========== VERIFICAR EMAIL EXISTENTE ==========
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true } // Solo necesitamos saber si existe
    })

    if (existingUser) {
      // Mensaje genérico para evitar enumeración de usuarios
      return NextResponse.json(
        { message: 'No se pudo completar el registro. Verifica tus datos.' },
        { status: 400 }
      )
    }

    // ========== HASHEAR PASSWORD ==========
    const passwordHash = await hash(password, 12)

    // ========== CREAR USUARIO ==========
    // NOTA: NO hay backdoor de admin. Los admins se crean manualmente en DB.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        passwordUpdatedAt: new Date(),
        role,
        planType: 'free_amateur',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // NO incluir passwordHash en respuesta
      }
    })

    // ========== ENVIAR EMAIL DE BIENVENIDA (no-blocking) ==========
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(name, email, role)
    } catch (emailError) {
      // Log interno, no exponer al usuario
      console.error('[REGISTER] Email send failed (non-critical):', emailError)
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('[REGISTER] Error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

---

# C) FIX LOGIN (NextAuth Credentials)

## Archivo: lib/auth.ts

```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

// Constantes de seguridad
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutos

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // ========== VALIDACIÓN BÁSICA ==========
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          return null
        }

        const email = credentials.email.toLowerCase().trim()

        try {
          // ========== BUSCAR USUARIO ==========
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              planType: true,
              passwordHash: true,
              isActive: true,
              failedLoginAttempts: true,
              lockedUntil: true,
            }
          })

          // Mensaje genérico para evitar enumeración de usuarios
          const genericError = () => {
            console.log('[AUTH] Invalid credentials for:', email)
            return null
          }

          // ========== VERIFICACIONES DE SEGURIDAD ==========
          
          // Usuario no existe
          if (!user) {
            // Simular tiempo de hash para evitar timing attack
            await compare('dummy', '$2a$12$dummy.hash.to.prevent.timing.attacks')
            return genericError()
          }

          // Usuario desactivado
          if (!user.isActive) {
            console.log('[AUTH] Inactive user attempted login:', email)
            return genericError()
          }

          // Usuario bloqueado temporalmente
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            console.log('[AUTH] Locked user attempted login:', email)
            return genericError()
          }

          // Usuario sin passwordHash (creado antes de la migración)
          if (!user.passwordHash) {
            console.log('[AUTH] User without passwordHash:', email)
            return genericError()
          }

          // ========== VERIFICAR PASSWORD ==========
          const isValidPassword = await compare(credentials.password, user.passwordHash)

          if (!isValidPassword) {
            // Incrementar contador de intentos fallidos
            const newAttempts = (user.failedLoginAttempts || 0) + 1
            const updateData: any = { failedLoginAttempts: newAttempts }

            // Bloquear si excede intentos máximos
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
              updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
              console.log('[AUTH] User locked due to failed attempts:', email)
            }

            await prisma.user.update({
              where: { id: user.id },
              data: updateData
            })

            return genericError()
          }

          // ========== LOGIN EXITOSO ==========
          // Resetear contador de intentos fallidos
          if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              }
            })
          }

          console.log('[AUTH] Successful login:', email)

          // Retornar datos para JWT (NO incluir passwordHash)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            planType: user.planType,
          }

        } catch (error) {
          console.error('[AUTH] Database error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).planType = token.planType as string
        if (token.image) {
          session.user.image = token.image as string
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // Login inicial
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
        ;(token as any).planType = (user as any).planType
        if (user.image) {
          token.image = user.image
        }
      }
      
      // Update de sesión (cuando se llama update() desde el cliente)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.image) token.image = session.image
      }
      
      return token
    },
  },
  events: {
    async signIn({ user }) {
      console.log('[AUTH] Sign in event:', user.email)
    },
    async signOut({ token }) {
      console.log('[AUTH] Sign out event:', token?.email)
    },
  },
}
```

---

# D) MIDDLEWARE GLOBAL

## Archivo: middleware.ts (en raíz del proyecto, NO en /app)

```typescript
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/publicar',
]

// Rutas que requieren rol admin
const ADMIN_ROUTES = [
  '/admin',
]

// Rutas de auth (redirigir si ya está autenticado)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
]

// Rutas públicas de API que no necesitan protección a nivel middleware
// (tienen su propia protección en el handler)
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/opportunities',
  '/api/resources',
  '/api/stripe/webhook',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ========== SKIP API ROUTES (protegidas internamente) ==========
  if (pathname.startsWith('/api/')) {
    // Solo proteger /api/admin a nivel middleware como capa extra
    if (pathname.startsWith('/api/admin')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (token.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }
    return NextResponse.next()
  }

  // ========== OBTENER TOKEN JWT ==========
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const isAdmin = token?.role === 'admin'

  // ========== REDIRIGIR AUTH ROUTES SI YA AUTENTICADO ==========
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ========== VERIFICAR RUTAS PROTEGIDAS ==========
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))

  // Si no autenticado y es ruta protegida => login
  if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si es ruta admin y no es admin => dashboard
  if (isAdminRoute && !isAdmin) {
    console.log('[MIDDLEWARE] Non-admin attempted to access:', pathname)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ========== HEADERS DE SEGURIDAD ==========
  const response = NextResponse.next()
  
  // Añadir headers de seguridad básicos
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

---

# E) HELPERS CENTRALIZADOS

## Archivo: lib/access.ts (NUEVO)

```typescript
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

// ========== TIPOS ==========

interface SessionUser {
  id: string
  role?: string
  planType?: string
  email?: string
  name?: string
}

interface OpportunityForAccess {
  authorId: string
  organization?: {
    ownerId: string
  } | null
}

interface ApplicationForAccess {
  userId: string
  opportunity: {
    organization?: {
      ownerId: string
    } | null
  }
}

type SessionWithUser = Session & {
  user: SessionUser
}

// ========== HELPERS DE SESIÓN ==========

/**
 * Verifica que existe sesión válida
 * @returns NextResponse 401 si no hay sesión, null si OK
 */
export function requireSession(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return null
}

/**
 * Obtiene el ID del usuario de forma segura
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null
}

/**
 * Obtiene el rol del usuario de forma segura
 */
export function getUserRole(session: Session | null): string | null {
  return (session?.user as SessionUser)?.role || null
}

// ========== HELPERS DE ROLES ==========

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(session: Session | null): boolean {
  const role = getUserRole(session)
  return role === 'admin'
}

/**
 * Verifica si el usuario es club o agencia
 */
export function isClubOrAgency(session: Session | null): boolean {
  const role = getUserRole(session)
  return role === 'club' || role === 'agencia'
}

/**
 * Verifica si el usuario tiene plan premium
 */
export function isPremiumUser(session: Session | null): boolean {
  const planType = (session?.user as SessionUser)?.planType
  const freePlans = ['free_amateur', 'gratis', 'free']
  return planType ? !freePlans.includes(planType) : false
}

// ========== HELPERS DE PERMISOS - OPPORTUNITIES ==========

/**
 * Verifica si el usuario puede gestionar (editar/borrar) una oportunidad
 * Reglas:
 * - Admin: siempre puede
 * - Autor: siempre puede
 * - Dueño de la organización: puede si existe organización
 */
export function canManageOpportunity(
  session: Session | null,
  opportunity: OpportunityForAccess
): boolean {
  if (!session?.user?.id) return false
  
  const userId = session.user.id
  
  // Admin puede todo
  if (isAdmin(session)) return true
  
  // El autor puede gestionar
  if (opportunity.authorId === userId) return true
  
  // El dueño de la organización puede gestionar (si existe organización)
  if (opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verifica y retorna respuesta de error si no puede gestionar
 * @returns NextResponse 403 si no tiene permiso, null si OK
 */
export function requireManageOpportunity(
  session: Session | null,
  opportunity: OpportunityForAccess
): NextResponse | null {
  if (!canManageOpportunity(session, opportunity)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

// ========== HELPERS DE PERMISOS - APPLICATIONS ==========

/**
 * Verifica si el usuario puede ver una aplicación
 * Reglas:
 * - Admin: siempre puede
 * - El aplicante (userId): puede ver su propia aplicación
 * - El dueño de la organización de la oportunidad: puede ver
 */
export function canViewApplication(
  session: Session | null,
  application: ApplicationForAccess
): boolean {
  if (!session?.user?.id) return false
  
  const userId = session.user.id
  
  // Admin puede todo
  if (isAdmin(session)) return true
  
  // El aplicante puede ver su propia aplicación
  if (application.userId === userId) return true
  
  // El dueño de la organización puede ver (si existe organización)
  if (application.opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verifica y retorna respuesta de error si no puede ver
 */
export function requireViewApplication(
  session: Session | null,
  application: ApplicationForAccess
): NextResponse | null {
  if (!canViewApplication(session, application)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Verifica si el usuario puede cambiar el estado de una aplicación
 * Reglas:
 * - Admin: siempre puede
 * - El dueño de la organización de la oportunidad: puede cambiar estado
 * - El aplicante: NO puede cambiar estado (solo el empleador/admin)
 */
export function canUpdateApplicationState(
  session: Session | null,
  application: ApplicationForAccess
): boolean {
  if (!session?.user?.id) return false
  
  // Admin puede todo
  if (isAdmin(session)) return true
  
  // Solo el dueño de la organización puede cambiar estado
  const userId = session.user.id
  if (application.opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verifica y retorna respuesta de error si no puede actualizar estado
 */
export function requireUpdateApplicationState(
  session: Session | null,
  application: ApplicationForAccess
): NextResponse | null {
  if (!canUpdateApplicationState(session, application)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

// ========== HELPER PARA ADMIN ==========

/**
 * Verifica que el usuario es admin
 * @returns NextResponse 403 si no es admin, null si OK
 */
export function requireAdmin(session: Session | null): NextResponse | null {
  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Combina requireSession + requireAdmin
 */
export function requireAdminSession(session: Session | null): NextResponse | null {
  const sessionError = requireSession(session)
  if (sessionError) return sessionError
  
  const adminError = requireAdmin(session)
  if (adminError) return adminError
  
  return null
}
```

---

# F) REFACTOR ENDPOINTS PARA USAR HELPERS

## F.1 app/api/opportunities/[slug]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { opportunityUpdateSchema } from '@/lib/validations'
import { sanitizeMarkdown, sanitizeInput } from '@/lib/sanitize'
import { 
  requireSession, 
  requireManageOpportunity, 
  isAdmin,
  getUserId 
} from '@/lib/access'

export const dynamic = 'force-dynamic'

interface Params {
  params: { slug: string }
}

// GET /api/opportunities/[slug] - Detalle de oportunidad
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
            verified: true,
            ownerId: true, // Necesario para checks de permisos
          },
        },
        author: {
          select: { id: true, name: true },
        },
        _count: {
          select: { applications: true, favorites: true },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Solo mostrar oportunidades publicadas al público
    const session = await getServerSession(authOptions)
    const userId = getUserId(session)
    const userIsAdmin = isAdmin(session)
    const isOwner = userId === opportunity.authorId
    const isOrgOwner = userId === opportunity.organization?.ownerId

    if (opportunity.status !== 'publicada' && !isOwner && !isOrgOwner && !userIsAdmin) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Eliminar ownerId de la respuesta pública
    const { organization, ...rest } = opportunity
    const safeOrganization = organization ? {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      description: organization.description,
      verified: organization.verified,
    } : null

    return NextResponse.json({ ...rest, organization: safeOrganization })

  } catch (error) {
    console.error('Get opportunity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT/PATCH /api/opportunities/[slug] - Actualizar oportunidad
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar sesión
    const sessionError = requireSession(session)
    if (sessionError) return sessionError

    // Obtener oportunidad con datos necesarios para verificar permisos
    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: {
          select: { ownerId: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Verificar permisos usando helper centralizado
    const permissionError = requireManageOpportunity(session, existing)
    if (permissionError) return permissionError

    // Parsear y validar body
    const body = await request.json()
    const validation = opportunityUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const sanitizedData: any = {}

    // Level mapping
    const levelMap: Record<string, string> = {
      'acb': 'profesional',
      'primera_feb': 'profesional',
      'segunda_feb': 'semi_profesional',
      'tercera_feb': 'semi_profesional',
      'autonomica': 'semi_profesional',
      'provincial': 'amateur',
      'cantera': 'cantera',
      'amateur': 'amateur',
      'semipro': 'semi_profesional',
      'semi_pro': 'semi_profesional',
      'semi-pro': 'semi_profesional',
      'semi_profesional': 'semi_profesional',
      'profesional': 'profesional',
      'juvenil': 'cantera',
      'infantil': 'cantera',
    }

    // Sanitizar campos
    if (data.title) sanitizedData.title = sanitizeInput(data.title)
    if (data.description) sanitizedData.description = sanitizeMarkdown(data.description)
    if (data.requirements) sanitizedData.requirements = sanitizeMarkdown(data.requirements)
    if (data.benefits) sanitizedData.benefits = sanitizeMarkdown(data.benefits)
    if (data.tags) sanitizedData.tags = data.tags.map((tag: string) => sanitizeInput(tag))
    if (data.type) sanitizedData.type = data.type
    if (data.level) sanitizedData.level = levelMap[data.level] || data.level
    if (data.city) sanitizedData.city = data.city
    if (data.country) sanitizedData.country = data.country
    if (data.contactEmail) sanitizedData.contactEmail = data.contactEmail
    if (data.contactPhone) sanitizedData.contactPhone = data.contactPhone
    if (data.applicationUrl !== undefined) {
      sanitizedData.applicationUrl = data.applicationUrl === '' ? null : data.applicationUrl
    }
    if (data.deadline) sanitizedData.deadline = new Date(data.deadline)
    if (data.startDate) sanitizedData.startDate = new Date(data.startDate)
    if (data.remunerationType) sanitizedData.remunerationType = data.remunerationType
    if (data.remunerationMin !== undefined) {
      sanitizedData.remunerationMin = data.remunerationMin === '' ? null : parseFloat(data.remunerationMin)
    }
    if (data.remunerationMax !== undefined) {
      sanitizedData.remunerationMax = data.remunerationMax === '' ? null : parseFloat(data.remunerationMax)
    }

    // Actualizar
    const opportunity = await prisma.opportunity.update({
      where: { slug: params.slug },
      data: sanitizedData,
      include: {
        organization: {
          select: { name: true, slug: true, logo: true, verified: true },
        },
      },
    })

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Update opportunity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return PUT(request, { params })
}

// DELETE /api/opportunities/[slug] - Eliminar oportunidad
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar sesión
    const sessionError = requireSession(session)
    if (sessionError) return sessionError

    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: {
          select: { ownerId: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Verificar permisos usando helper centralizado
    const permissionError = requireManageOpportunity(session, existing)
    if (permissionError) return permissionError

    await prisma.opportunity.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete opportunity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## F.2 app/api/applications/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationUpdateSchema } from '@/lib/validations'
import { sendApplicationStateChangeEmail } from '@/lib/email'
import {
  requireSession,
  requireViewApplication,
  requireUpdateApplicationState,
} from '@/lib/access'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

// GET /api/applications/[id] - Ver aplicación individual
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar sesión
    const sessionError = requireSession(session)
    if (sessionError) return sessionError

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        opportunity: {
          select: {
            id: true,
            slug: true,
            title: true,
            type: true,
            level: true,
            city: true,
            organizationId: true,
            organization: {
              select: { name: true, ownerId: true },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verificar permisos usando helper centralizado
    const permissionError = requireViewApplication(session, application)
    if (permissionError) return permissionError

    // Eliminar ownerId de la respuesta
    const { opportunity, ...rest } = application
    const safeOpportunity = {
      ...opportunity,
      organization: opportunity.organization ? {
        name: opportunity.organization.name,
      } : null,
    }

    return NextResponse.json({ ...rest, opportunity: safeOpportunity })

  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/applications/[id] - Cambiar estado de aplicación
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar sesión
    const sessionError = requireSession(session)
    if (sessionError) return sessionError

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        opportunity: {
          select: {
            title: true,
            organizationId: true,
            organization: {
              select: { ownerId: true },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verificar permisos usando helper centralizado
    const permissionError = requireUpdateApplicationState(session, application)
    if (permissionError) return permissionError

    // Parsear y validar body
    const body = await request.json()
    const validation = applicationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { state } = validation.data
    const previousState = application.state

    // Actualizar estado
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { state },
      include: {
        user: {
          select: { name: true, email: true },
        },
        opportunity: {
          select: { title: true },
        },
      },
    })

    // Enviar email de notificación si cambió el estado
    if (state !== previousState && ['en_revision', 'rechazada', 'aceptada'].includes(state)) {
      try {
        await sendApplicationStateChangeEmail(
          updatedApplication.user.email,
          updatedApplication.user.name || 'Candidato',
          updatedApplication.opportunity.title,
          state
        )
      } catch (emailError) {
        console.error('Failed to send state change notification email:', emailError)
      }
    }

    return NextResponse.json(updatedApplication)

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## F.3 app/api/admin/opportunities/[opportunityId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/access'

export const dynamic = 'force-dynamic'

interface Params {
  params: { opportunityId: string }
}

// PATCH /api/admin/opportunities/[opportunityId] - Aprobar/rechazar oportunidad
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar sesión + admin usando helper centralizado
    const authError = requireAdminSession(session)
    if (authError) return authError

    const body = await request.json()
    const { status } = body

    // Validar status
    const validStatuses = ['publicada', 'borrador', 'cerrada', 'rechazada']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: publicada, borrador, cerrada, rechazada' },
        { status: 400 }
      )
    }

    // Verificar que la oportunidad existe
    const existing = await prisma.opportunity.findUnique({
      where: { id: params.opportunityId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateData: any = { status }

    if (status === 'publicada') {
      updateData.publishedAt = new Date()
    }

    if (status === 'borrador' || status === 'rechazada') {
      updateData.publishedAt = null
    }

    // Actualizar
    const opportunity = await prisma.opportunity.update({
      where: { id: params.opportunityId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // TODO: Enviar email al autor notificando el cambio de estado

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Admin update opportunity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

# G) PRISMA LOGGING SEGURO

## Archivo: lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar logging según entorno
const prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] // Desarrollo: logs completos
    : ['error'],                  // Producción: solo errores
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions)

// Evitar múltiples instancias en desarrollo (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

---

# H) CHECKLIST FINAL DE PRODUCCIÓN

## 1. Rotación de NEXTAUTH_SECRET
```bash
# Generar nuevo secret (mínimo 32 caracteres)
openssl rand -base64 32

# Actualizar en Vercel/entorno de producción
# IMPORTANTE: Esto invalidará TODAS las sesiones existentes
```

## 2. Invalidación de sesiones existentes
- Al cambiar NEXTAUTH_SECRET, todas las sesiones JWT existentes se invalidan automáticamente
- Los usuarios deberán volver a iniciar sesión
- Comunicar el cambio con antelación si es posible

## 3. Usuarios existentes sin passwordHash
```sql
-- Consultar usuarios afectados
SELECT id, email, name, role, "createdAt" 
FROM users 
WHERE "passwordHash" IS NULL;

-- Opciones:
-- A) Enviar email de reset de password a todos
-- B) Forzar reset en próximo login
-- C) Generar password temporal hasheado y enviarlo por email

-- Ejemplo: marcar usuarios para reset obligatorio
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mustResetPassword" BOOLEAN DEFAULT FALSE;
UPDATE users SET "mustResetPassword" = TRUE WHERE "passwordHash" IS NULL;
```

## 4. Pruebas manuales obligatorias

| Test | Cómo | Resultado esperado |
|------|------|-------------------|
| Login con password incorrecto | Intentar login con email válido + password malo | 401, mensaje genérico |
| Login con usuario inexistente | Intentar login con email random | 401, mensaje genérico (sin enumerar) |
| Registro spam | 6 registros en 1 minuto desde misma IP | 429 en el 6to intento |
| Acceso /admin sin ser admin | Login como jugador, ir a /admin | Redirect a /dashboard |
| API /api/admin sin ser admin | POST /api/admin/import sin rol admin | 403 Admin access required |
| IDOR oportunidades | Editar oportunidad de otro usuario | 403 Insufficient permissions |
| IDOR aplicaciones | Ver aplicación de otro usuario | 403 Insufficient permissions |
| Cambiar estado sin permiso | PATCH aplicación sin ser org owner | 403 Insufficient permissions |
| Brute force login | 6 logins fallidos seguidos | Usuario bloqueado 15 min |
| Usuario bloqueado | Login con usuario bloqueado | 401 mensaje genérico |

## 5. Variables de entorno requeridas
```env
# Auth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="min-32-caracteres-aleatorios"

# Database
DATABASE_URL="postgresql://..."

# Ya existentes (verificar que estén)
RESEND_API_KEY="..."
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

## 6. Comandos de despliegue
```bash
# 1. Aplicar cambios de schema
npx prisma db push
# O si usas migraciones:
npx prisma migrate deploy

# 2. Regenerar cliente Prisma
npx prisma generate

# 3. Build
npm run build

# 4. Verificar que no hay errores de tipo
npx tsc --noEmit
```

## 7. Monitoreo post-deploy
- Verificar logs de Vercel/servidor los primeros 30 minutos
- Buscar errores `[AUTH]` en logs
- Verificar que login/registro funcionan
- Probar flujo completo: registro → login → crear oportunidad

## 8. Rollback plan
- Mantener backup del código anterior
- Si falla auth: revertir a commit anterior
- Si fallan migraciones: tener script SQL de rollback listo

## 9. Comunicación a usuarios
- Notificar si cambia el flow de login
- Email a usuarios existentes sobre reset de password (si aplica)
- Actualizar documentación/FAQ si hay cambios visibles

## 10. Siguiente iteración de seguridad
- [ ] Implementar "Olvidé mi contraseña" con tokens seguros
- [ ] Añadir 2FA opcional para admins
- [ ] Implementar rate limiting con Redis (persistente)
- [ ] Añadir audit log de acciones sensibles
- [ ] Configurar CSP headers más estrictos
- [ ] Habilitar RLS en Supabase
- [ ] Revisión de seguridad trimestral

---

**Documento generado: 26/02/2026**
**Autor: Security Review**
