# INFORME TÉCNICO DE SEGURIDAD - WorkHoops
## Para revisión de CTO

---

# 1. SEGURIDAD Y AUTENTICACIÓN

## 1.1 lib/auth.ts (COMPLETO)

```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // ⚠️ VULNERABILIDAD CRÍTICA: Acepta cualquier contraseña
          // En producción, se debe comparar con hash almacenado:
          // const isValid = await compare(credentials.password, user.passwordHash)
          // if (!isValid) return null
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            planType: user.planType,
          }
        } catch (error) {
          console.error('Auth error:', error)
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
        ;(token as any).planType = (user as any).planType
        if (user.image) {
          token.image = user.image
        }
      }
      return token
    },
  },
}
```

**🚨 VULNERABILIDADES IDENTIFICADAS:**
1. NO valida contraseña (acepta cualquier password para usuarios existentes)
2. NO hay campo `passwordHash` en el schema de User
3. `compare` de bcryptjs importado pero NO usado

---

## 1.2 middleware.ts

```
⚠️ NO EXISTE middleware.ts
```

**IMPLICACIÓN:** No hay protección de rutas a nivel de middleware. Toda la protección se hace en cada API route individualmente con `getServerSession()`.

---

## 1.3 lib/prisma.ts (COMPLETO)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],  // ⚠️ Logging queries en producción puede exponer datos
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 1.4 lib/rate-limit.ts (COMPLETO)

```typescript
// ⚠️ Rate limiter EN MEMORIA - NO persiste entre reinicios
// ⚠️ NO funciona en entornos serverless/multi-instancia

interface RateLimitEntry {
  timestamp: number
  count: number
}

const rateLimitStore = new Map<string, RateLimitEntry[]>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - window
  
  let entries = rateLimitStore.get(identifier) || []
  entries = entries.filter(entry => entry.timestamp > windowStart)
  
  const currentCount = entries.length
  
  if (currentCount >= limit) {
    const oldestEntry = entries[0]
    const resetTime = oldestEntry 
      ? new Date(oldestEntry.timestamp + window)
      : new Date(now + window)
    
    return { success: false, limit, remaining: 0, reset: resetTime }
  }
  
  entries.push({ timestamp: now, count: 1 })
  rateLimitStore.set(identifier, entries)
  
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - (currentCount + 1)),
    reset: new Date(now + window),
  }
}

export async function rateLimitByIP(ip: string, limit: number = 10, window: number = 60 * 1000) {
  return rateLimit(`ip:${ip}`, limit, window)
}

export async function rateLimitByUser(userId: string, limit: number = 10, window: number = 60 * 1000) {
  return rateLimit(`user:${userId}`, limit, window)
}
```

---

## 1.5 app/api/auth/register/route.ts (COMPLETO)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['jugador', 'entrenador', 'club']).default('jugador'),
  planType: z.enum(['free_amateur', 'pro_semipro', 'club_agencia', 'destacado']).default('free_amateur'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    const { name, email, password, role, planType } = validatedData

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 })
    }

    // ⚠️ VULNERABILIDAD: hash() importado pero comentado, NO se almacena password
    // const hashedPassword = await hash(password, 12)

    // ⚠️ VULNERABILIDAD: Backdoor para admin - cualquiera puede registrarse como admin
    const finalRole = email === 'admin@workhoops.com' ? 'admin' : role
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: finalRole,
        planType,
        // ⚠️ NO se guarda passwordHash
      }
    })

    // Envío de emails (no-crítico)
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(name, email, finalRole)
    } catch (emailError) {
      console.error('[REGISTER] Failed to send welcome email:', emailError)
    }

    return NextResponse.json({ message: 'Usuario creado exitosamente', user })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
```

**🚨 VULNERABILIDADES:**
1. Password NO se hashea ni almacena
2. Backdoor: `admin@workhoops.com` obtiene rol admin automáticamente
3. Sin rate limiting en registro

---

## 1.6 app/api/uploads/sign/route.ts (COMPLETO)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generatePresignedUrl, validateFileType, validateFileSize } from '@/lib/s3'
import { fileUploadSchema } from '@/lib/validations'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting aplicado
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000)

    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: {...} })
    }

    // ✅ Requiere autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validation = fileUploadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }

    const { fileName, fileType, fileSize } = validation.data

    // ✅ Validación de tipo de archivo
    if (!validateFileType(fileType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // ✅ Validación de tamaño
    if (!validateFileSize(fileSize)) {
      return NextResponse.json({ error: `File size exceeds limit` }, { status: 400 })
    }

    // Genera URL pre-firmada para S3
    const { uploadUrl, fileUrl, key } = await generatePresignedUrl(fileName, fileType, fileSize, folder)

    return NextResponse.json({ uploadUrl, fileUrl, key })

  } catch (error) {
    console.error('Upload sign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Estado**: ✅ Bien protegido

---

## 1.7 app/api/stripe/webhook/route.ts (COMPLETO)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, handleSubscriptionSuccess, handleOneTimePaymentSuccess } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      // ✅ Verifica firma de Stripe
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status === 'paid') {
          if (session.mode === 'subscription') {
            await handleSubscriptionSuccess(session)
          } else if (session.mode === 'payment') {
            await handleOneTimePaymentSuccess(session)
          }
        }
        break

      case 'customer.subscription.deleted':
        // Maneja cancelación de suscripción
        const subscription = event.data.object as Stripe.Subscription
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { planType: 'free_amateur', stripeSubscriptionId: null }
          })
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Estado**: ✅ Bien implementado con verificación de firma

---

## 1.8 Uso de SUPABASE_SERVICE_ROLE_KEY

**Único archivo que usa la key:**

### app/api/resources/upload-image/route.ts

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usa service role para bypass RLS en uploads de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  // ✅ Requiere autenticación
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // ✅ Solo admins pueden subir imágenes de recursos
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Sube archivo a Supabase Storage
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, buffer, { contentType: file.type })
  
  // ...
}
```

**¿Por qué se usa?** Para bypasear RLS en Supabase Storage y permitir uploads directos desde el backend. Solo accesible para admins.

**Estado**: ✅ Protegido correctamente (requiere admin)

---

# 2. PRISMA SCHEMA (COMPLETO - 611 líneas)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  admin
  jugador
  entrenador  
  club
  agencia
}

enum OpportunityType {
  empleo
  prueba
  torneo
  clinica
  beca
  patrocinio
}

enum OpportunityStatus {
  borrador
  pendiente
  publicada
  cerrada
  cancelada
}

enum OpportunityLevel {
  amateur
  semi_profesional
  profesional
  cantera
}

enum Modality {
  presencial
  online
  mixta
}

enum ApplicationState {
  enviada
  en_revision
  aceptada
  rechazada
  finalizada
}

enum ResourceStatus {
  draft
  published
}

enum ResourceCategory {
  preparacion
  carrera
  recursos
  salud
  tactica
  mental
}

// ==================== MODELS ====================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
  @@map("verification_tokens")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(jugador)
  locale        String    @default("es")
  verified      Boolean   @default(false)
  
  // Plan information
  planType      String    @default("free_amateur")
  planStart     DateTime?
  planEnd       DateTime?
  isActive      Boolean   @default(true)
  stripeCustomerId String?
  stripeSubscriptionId String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  organizations Organization[]
  opportunities Opportunity[]
  applications  Application[]
  favorites     Favorite[]
  auditLogs     AuditLog[]
  subscriptions Subscription[]
  talentProfile TalentProfile?
  coachProfile  CoachProfile?
  clubAgencyProfile ClubAgencyProfile?
  interestNotifications InterestNotification[]
  resources     Resource[]
  notifications Notification[]

  @@map("users")
}

model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  website     String?
  logo        String?
  verified    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  owner         User          @relation(fields: [ownerId], references: [id])
  ownerId       String
  opportunities Opportunity[]
  @@map("organizations")
}

model Opportunity {
  id               String            @id @default(cuid())
  title            String
  slug             String            @unique
  description      String
  type             OpportunityType
  status           OpportunityStatus @default(borrador)
  level            OpportunityLevel
  city      String?
  country   String   @default("España")
  latitude  Float?
  longitude Float?
  modality  Modality @default(presencial)
  remunerationType String?
  remunerationMin  Float?
  remunerationMax  Float?
  currency         String  @default("EUR")
  benefits    String?
  deadline    DateTime?
  startDate   DateTime?
  endDate     DateTime?
  publishedAt DateTime?
  tags        String?
  verified    Boolean @default(false)
  contactEmail String
  contactPhone String?
  applicationUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  authorId       String
  author         User          @relation(fields: [authorId], references: [id])
  applications   Application[]
  favorites      Favorite[]
  @@map("opportunities")
}

model Application {
  id        String           @id @default(cuid())
  state     ApplicationState @default(enviada)
  message   String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  opportunityId String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  @@unique([userId, opportunityId])
  @@map("applications")
}

model Favorite {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  opportunityId String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  @@unique([userId, opportunityId])
  @@map("favorites")
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  action    String
  entity    String
  entityId  String
  metadata  String?
  createdAt DateTime @default(now())
  actor User @relation(fields: [actorId], references: [id])
  @@map("audit_logs")
}

model Subscription {
  id                   String    @id @default(cuid())
  userId               String
  stripeSubscriptionId String    @unique
  stripePriceId        String
  stripeCustomerId     String
  status               String
  planType             String
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("subscriptions")
}

model TalentProfile {
  id          String   @id @default(cuid())
  fullName    String
  birthDate   DateTime
  role        String
  city        String
  country     String   @default("España")
  position    String?
  secondaryPosition String?
  height      Int?
  weight      Int?
  wingspan    Int?
  dominantHand String?
  currentLevel String?
  lastTeam    String?
  currentCategory String?
  playingStyle String?
  languages   String?
  willingToTravel Boolean @default(false)
  weeklyCommitment Int?
  internationalExperience Boolean @default(false)
  hasLicense  Boolean @default(false)
  injuryHistory String?
  currentGoal String?
  bio         String?
  videoUrl    String?
  fullGameUrl String?
  socialUrl   String?
  photoUrls   String?
  profileCompletionPercentage Int @default(0)
  isPublic    Boolean  @default(true)
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  playerSkills PlayerSkills?
  interestNotifications InterestNotification[]
  @@map("talent_profiles")
}

model PlayerSkills {
  id                String   @id @default(cuid())
  talentProfileId   String   @unique
  threePointShot    Int @default(3)
  midRangeShot      Int @default(3)
  finishing         Int @default(3)
  ballHandling      Int @default(3)
  playmaking        Int @default(3)
  offBallMovement   Int @default(3)
  individualDefense Int @default(3)
  teamDefense       Int @default(3)
  offensiveRebound  Int @default(3)
  defensiveRebound  Int @default(3)
  speed             Int @default(3)
  athleticism       Int @default(3)
  endurance         Int @default(3)
  leadership        Int @default(3)
  decisionMaking    Int @default(3)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  talentProfile     TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)
  @@map("player_skills")
}

model CoachProfile {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName              String
  birthYear             Int?
  nationality           String    @default("España")
  languages             String?
  city                  String
  willingToRelocate     Boolean   @default(false)
  currentLevel          String?
  federativeLicense     String?
  totalExperience       Int?
  // ... (más campos de skills y experiencia)
  isPublic              Boolean   @default(true)
  verified              Boolean   @default(false)
  profileCompletionPercentage Int @default(0)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  @@map("coach_profiles")
}

model ClubAgencyProfile {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  entityType            String
  legalName             String
  commercialName        String?
  country               String    @default("España")
  province              String?
  city                  String
  // ... (más campos de contacto y necesidades)
  verified              Boolean   @default(false)
  isPublic              Boolean   @default(true)
  profileCompletionPercentage Int @default(0)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  @@map("club_agency_profiles")
}

model InterestNotification {
  id                String    @id @default(cuid())
  profileId         String
  interestedUserId  String
  message           String?
  status            String    @default("pending")
  createdAt         DateTime  @default(now())
  talentProfile     TalentProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  interestedUser    User          @relation(fields: [interestedUserId], references: [id], onDelete: Cascade)
  @@index([profileId])
  @@index([interestedUserId])
  @@map("interest_notifications")
}

model Resource {
  id              String            @id @default(cuid())
  title           String
  slug            String            @unique
  excerpt         String            @db.Text
  content         String            @db.Text
  category        ResourceCategory
  status          ResourceStatus    @default(draft)
  featured        Boolean           @default(false)
  featuredImage   String?
  author          String
  readTime        Int               @default(5)
  views           Int               @default(0)
  metaTitle       String?
  metaDescription String?
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  publishedAt     DateTime?
  @@index([slug])
  @@index([category])
  @@index([status])
  @@map("resources")
}

model Notification {
  id          String   @id @default(cuid())
  type        String
  title       String
  message     String
  link        String?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@map("notifications")
}
```

## 2.1 Relaciones y onDelete Relevantes

| Relación | onDelete | Implicación |
|----------|----------|-------------|
| Account → User | CASCADE | Eliminar user elimina accounts |
| Session → User | CASCADE | Eliminar user elimina sessions |
| Application → Opportunity | CASCADE | Eliminar oportunidad elimina aplicaciones |
| Application → User | CASCADE | Eliminar user elimina sus aplicaciones |
| Favorite → Opportunity | CASCADE | Eliminar oportunidad elimina favoritos |
| Favorite → User | CASCADE | Eliminar user elimina sus favoritos |
| Subscription → User | CASCADE | Eliminar user elimina suscripciones |
| TalentProfile → User | CASCADE | Eliminar user elimina perfil |
| CoachProfile → User | CASCADE | Eliminar user elimina perfil |
| ClubAgencyProfile → User | CASCADE | Eliminar user elimina perfil |
| PlayerSkills → TalentProfile | CASCADE | Eliminar perfil elimina skills |
| Resource → User | CASCADE | Eliminar user elimina sus recursos |
| Notification → User | CASCADE | Eliminar user elimina notificaciones |
| **Organization → User** | **NINGUNO** | ⚠️ No se puede eliminar user con organizaciones |
| **Opportunity → User** | **NINGUNO** | ⚠️ No se puede eliminar user con oportunidades |

---

# 3. MAPA DE PERMISOS REAL

| Endpoint | Requiere Sesión | Requiere Rol | Checks Actuales | Riesgo si Falla |
|----------|-----------------|--------------|-----------------|-----------------|
| `POST /api/auth/register` | ❌ | ❌ | Validación Zod | MEDIO: Spam de cuentas |
| `POST /api/auth/[...nextauth]` | ❌ | ❌ | Busca user por email | 🚨 CRÍTICO: Acepta cualquier password |
| `GET /api/opportunities` | ❌ | ❌ | Solo `publicada` | BAJO |
| `POST /api/opportunities` | ✅ | ❌ | `session.user.id` + límites por plan | MEDIO: Usuario podría crear spam |
| `GET /api/opportunities/[slug]` | Parcial | ❌ | Oculta no-publicadas a no-autores | BAJO |
| `PUT /api/opportunities/[slug]` | ✅ | ❌ | `author` OR `org.owner` OR `admin` | MEDIO: IDOR si falla |
| `DELETE /api/opportunities/[slug]` | ✅ | ❌ | `author` OR `org.owner` OR `admin` | ALTO: Borrado no autorizado |
| `GET /api/applications` | ✅ | ❌ | Solo propias (`userId`) | MEDIO: Fuga de datos |
| `POST /api/applications` | ✅ | ❌ | Rate limit + no duplicados + deadline | MEDIO: Spam de aplicaciones |
| `GET /api/applications/[id]` | ✅ | ❌ | `applicant` OR `org.owner` OR `admin` | ALTO: Fuga de datos sensibles |
| `PATCH /api/applications/[id]` | ✅ | ❌ | Solo `org.owner` OR `admin` | ALTO: Cambio de estado no autorizado |
| `POST /api/uploads/sign` | ✅ | ❌ | Rate limit + validación archivo | MEDIO: Abuso de storage |
| `POST /api/resources/upload-image` | ✅ | **admin** | `role === 'admin'` | BAJO: Solo admins |
| `POST /api/admin/import` | ✅ | **admin** | `role === 'admin'` | BAJO: Solo admins |
| `POST /api/stripe/webhook` | ❌ | ❌ | Firma de Stripe | BAJO: Stripe protege |
| `POST /api/stripe/create-checkout` | ✅ | ❌ | `session.user.id` | MEDIO: Podría crear sesiones falsas |
| `GET /api/notifications` | ✅ | ❌ | Solo propias (`userId`) | BAJO |
| `GET /api/favorites` | ✅ | ❌ | Solo propias (`userId`) | BAJO |
| `POST /api/talent/profile-onboarding` | ✅ | ❌ | `session.user.id` | BAJO |

---

# 4. MAPA DE FLUJOS REALES

## 4.1 Flujo JUGADOR

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ JUGADOR: Registro → Onboarding → Aplicar → Dashboard                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

1. REGISTRO
   Página:    /auth/register
   Endpoint:  POST /api/auth/register
   Tablas:    users (INSERT)
   Datos:     { name, email, password, role: 'jugador' }

2. LOGIN
   Página:    /auth/login
   Endpoint:  POST /api/auth/[...nextauth] (NextAuth)
   Tablas:    users (SELECT), sessions (INSERT)
   ⚠️ BUG:    No valida password

3. ONBOARDING (completar perfil)
   Página:    /profile/complete
   Endpoint:  POST /api/talent/profile-onboarding
   Tablas:    talent_profiles (INSERT), player_skills (INSERT)
   Datos:     { fullName, birthDate, position, height, weight, skills... }

4. EXPLORAR OPORTUNIDADES
   Página:    /oportunidades
   Endpoint:  GET /api/opportunities
   Tablas:    opportunities (SELECT), organizations (SELECT)
   Filtros:   status='publicada', publishedAt NOT NULL

5. VER DETALLE OPORTUNIDAD
   Página:    /oportunidades/[slug]
   Endpoint:  GET /api/opportunities/[slug]
   Tablas:    opportunities (SELECT), organizations (SELECT)
   Lógica:    Muestra contacto solo si está autenticado (gated content)

6. APLICAR A OPORTUNIDAD
   Página:    /oportunidades/[slug] (botón)
   Endpoint:  POST /api/applications
   Tablas:    applications (INSERT), users (SELECT para email)
   Validación: No duplicados, deadline no pasado, status='publicada'
   Email:     Notifica al dueño de la oportunidad

7. VER MIS APLICACIONES
   Página:    /dashboard/applications
   Endpoint:  GET /api/applications
   Tablas:    applications (SELECT), opportunities (SELECT)
   Filtro:    userId = session.user.id

8. DASHBOARD GENERAL
   Página:    /dashboard
   Endpoint:  GET /api/dashboard/analytics
   Tablas:    applications, opportunities, favorites
```

## 4.2 Flujo CLUB

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ CLUB: Registro → Onboarding → Publicar → Ver Candidatos                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

1. REGISTRO
   Página:    /auth/register
   Endpoint:  POST /api/auth/register
   Tablas:    users (INSERT)
   Datos:     { name, email, password, role: 'club' }

2. ONBOARDING CLUB
   Página:    /profile/complete
   Endpoint:  POST /api/club-agency/profile-onboarding
   Tablas:    club_agency_profiles (INSERT), organizations (INSERT)
   Datos:     { legalName, entityType, city, contactEmail, profilesNeeded... }

3. PUBLICAR OPORTUNIDAD
   Página:    /publicar
   Endpoint:  POST /api/opportunities
   Tablas:    opportunities (INSERT), organizations (SELECT/INSERT)
   Validación: Límite por plan (1 gratis, 3 premium)
   Estado:    status='borrador' (requiere aprobación admin)

4. MIS OPORTUNIDADES
   Página:    /dashboard (sección)
   Endpoint:  GET /api/opportunities (filtrado por authorId)
   Tablas:    opportunities (SELECT)

5. VER CANDIDATOS
   Página:    /dashboard/candidatos/[opportunityId]
   Endpoint:  GET /api/applications (filtrado por opportunityId)
   Tablas:    applications (SELECT), users (SELECT), talent_profiles (SELECT)
   Permiso:   Solo si eres org.owner de la oportunidad

6. CAMBIAR ESTADO APLICACIÓN
   Página:    /dashboard/candidatos/[opportunityId]
   Endpoint:  PATCH /api/applications/[id]
   Tablas:    applications (UPDATE)
   Estados:   enviada → en_revision → aceptada/rechazada
   Email:     Notifica al aplicante del cambio
```

## 4.3 Flujo ADMIN

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN: Aprobar Ofertas → Importar CSV → Gestionar Usuarios                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

1. LOGIN ADMIN
   Página:    /auth/login
   Endpoint:  POST /api/auth/[...nextauth]
   Acceso:    email = 'admin@workhoops.com' (backdoor) o role='admin' en DB

2. DASHBOARD ADMIN
   Página:    /admin
   Componente: AdminDashboard.tsx
   Datos:     Stats de users, opportunities, applications

3. APROBAR/RECHAZAR OFERTAS
   Página:    /admin/opportunities
   Endpoint:  PATCH /api/admin/opportunities/[opportunityId]
   Tablas:    opportunities (UPDATE)
   Acción:    status: 'borrador' → 'publicada', publishedAt = now()

4. GESTIONAR USUARIOS
   Página:    /admin/users
   Componente: AdminUsersManager.tsx
   Endpoint:  GET /api/user/... (varios)
   Tablas:    users (SELECT, UPDATE)

5. IMPORTAR CSV
   Página:    /admin/importar
   Endpoint:  POST /api/admin/import
   Tipos:     jugadores, entrenadores, clubes, ofertas
   Tablas:    users, talent_profiles, coach_profiles, organizations, opportunities
   Validación: role === 'admin', máx 1000 filas

6. GESTIONAR RECURSOS/BLOG
   Página:    /admin/recursos
   Endpoint:  GET/POST/PATCH /api/resources
   Tablas:    resources (CRUD)
   Upload:    POST /api/resources/upload-image (usa SUPABASE_SERVICE_ROLE_KEY)

7. SUBIR IMÁGENES (solo admin)
   Página:    /admin/recursos (editor)
   Endpoint:  POST /api/resources/upload-image
   Storage:   Supabase bucket 'uploads'
   Permiso:   role === 'admin'
```

---

# 5. RESUMEN DE VULNERABILIDADES

| Severidad | Descripción | Archivo | Acción Requerida |
|-----------|-------------|---------|------------------|
| 🚨 CRÍTICA | Password no validado en login | lib/auth.ts | Implementar hash/compare |
| 🚨 CRÍTICA | Password no almacenado en registro | api/auth/register | Guardar passwordHash |
| ⚠️ ALTA | Backdoor admin por email | api/auth/register | Eliminar condición hardcodeada |
| ⚠️ ALTA | Sin middleware de protección | middleware.ts | Crear middleware global |
| ⚠️ MEDIA | Rate limit en memoria | lib/rate-limit.ts | Usar Redis |
| ⚠️ MEDIA | Logging de queries en prod | lib/prisma.ts | Deshabilitar en producción |
| ℹ️ BAJA | RLS deshabilitado | Supabase | Habilitar policies |

---

**Documento generado: 26/02/2026**
