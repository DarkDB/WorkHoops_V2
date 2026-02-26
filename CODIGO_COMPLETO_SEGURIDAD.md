# CÓDIGO COMPLETO PARA REVISIÓN DE SEGURIDAD - WorkHoops
## Informe para CTO Externo

---

# 1. ENDPOINTS CRÍTICOS

## 1.1 app/api/opportunities/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const opportunityCreateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  type: z.string().min(1, 'El tipo es requerido'),
  level: z.string().min(1, 'El nivel es requerido'),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().default('España'),
  deadline: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  remunerationMin: z.string().optional().or(z.literal('')),
  remunerationMax: z.string().optional().or(z.literal('')),
  remunerationType: z.string().default('mensual'),
  contactEmail: z.string().email('Email de contacto inválido'),
  contactPhone: z.string().optional().or(z.literal('')),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  benefits: z.string().optional().or(z.literal('')),
  featured: z.boolean().default(false)
})

// GET - Público, sin autenticación
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 12
    const skip = (page - 1) * limit

    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'publicada',
        publishedAt: { not: null },
      },
      include: {
        organization: { select: { name: true, verified: true } },
        author: { select: { name: true } },
        _count: { select: { applications: true, favorites: true } }
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.opportunity.count({
      where: { status: 'publicada', publishedAt: { not: null } },
    })

    return NextResponse.json({
      opportunities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ message: 'Error fetching opportunities', error: error.message }, { status: 500 })
  }
}

// POST - Requiere autenticación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // ✅ Check de autenticación
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado. Debes iniciar sesión.' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = opportunityCreateSchema.parse(body)

    // Get user's plan type from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true }
    })

    const userPlanType = user?.planType || 'free_amateur'

    // Get user's current opportunities count
    const userOpportunities = await prisma.opportunity.count({
      where: {
        authorId: session.user.id,
        status: { in: ['borrador', 'publicada'] }
      }
    })

    // ✅ Check límites por plan
    const freePlans = ['free_amateur', 'gratis', 'free']
    const isPremiumPlan = !freePlans.includes(userPlanType)
    
    if (isPremiumPlan) {
      if (userOpportunities >= 3) {
        return NextResponse.json(
          { message: 'Has alcanzado el límite de 3 ofertas con tu plan.' },
          { status: 403 }
        )
      }
    } else {
      if (userOpportunities >= 1) {
        return NextResponse.json(
          { message: 'Ya tienes una oferta publicada. Actualiza al plan Pro.' },
          { status: 403 }
        )
      }
    }

    // Get or create organization for the user
    let organization = await prisma.organization.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!organization) {
      const orgName = session.user.name || 'Mi Organización'
      organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          ownerId: session.user.id,
          description: 'Organización creada automáticamente'
        }
      })
    }

    // Level mapping
    const levelMap: Record<string, string> = {
      'acb': 'profesional', 'primera_feb': 'profesional', 'segunda_feb': 'semi_profesional',
      'tercera_feb': 'semi_profesional', 'autonomica': 'semi_profesional', 'provincial': 'amateur',
      'cantera': 'cantera', 'amateur': 'amateur', 'semipro': 'semi_profesional',
      'semi_pro': 'semi_profesional', 'semi_profesional': 'semi_profesional',
      'profesional': 'profesional', 'juvenil': 'cantera', 'infantil': 'cantera',
    }
    
    const mappedLevel = levelMap[validatedData.level] || validatedData.level
    
    if (!['amateur', 'semi_profesional', 'profesional', 'cantera'].includes(mappedLevel)) {
      return NextResponse.json({ error: 'Nivel no válido' }, { status: 400 })
    }

    // Create opportunity - status='borrador' requiere aprobación admin
    const opportunity = await prisma.opportunity.create({
      data: {
        title: validatedData.title,
        slug: validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: validatedData.type as any,
        level: mappedLevel as any,
        description: validatedData.description,
        city: validatedData.city,
        country: validatedData.country,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        remunerationMin: validatedData.remunerationMin ? parseInt(validatedData.remunerationMin) : null,
        remunerationMax: validatedData.remunerationMax ? parseInt(validatedData.remunerationMax) : null,
        remunerationType: validatedData.remunerationType,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone || null,
        applicationUrl: validatedData.applicationUrl || null,
        benefits: validatedData.benefits || null,
        status: 'borrador' as any,
        publishedAt: null,
        authorId: session.user.id,
        organizationId: organization.id
      }
    })

    return NextResponse.json({ success: true, opportunity }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    console.error('Error creating opportunity:', error)
    return NextResponse.json({ message: 'Error al crear oportunidad' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno crítico. ✅ Auth check presente.

---

## 1.2 app/api/opportunities/[slug]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { opportunityCreateSchema, opportunityUpdateSchema } from '@/lib/validations'
import { sanitizeMarkdown, sanitizeInput } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

interface Params { params: { slug: string } }

// GET - Público con restricción para no-publicadas
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: { select: { id: true, name: true, slug: true, logo: true, description: true, verified: true } },
        author: { select: { id: true, name: true } },
        _count: { select: { applications: true, favorites: true } },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // ✅ Solo mostrar publicadas al público
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === opportunity.authorId
    const isAdmin = session?.user?.role === 'admin'

    if (opportunity.status !== 'publicada' && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT/PATCH - Requiere ser autor, org owner, o admin
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: { organization: { select: { ownerId: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // ✅ CHECK DE PERMISOS - autor OR org.owner OR admin
    const canEdit = 
      session.user.role === 'admin' ||
      existing.authorId === session.user.id ||
      existing.organization?.ownerId === session.user.id

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = opportunityUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }

    const data = validation.data
    const sanitizedData: any = {}
    
    // Level mapping
    const levelMap: Record<string, string> = {
      'acb': 'profesional', 'primera_feb': 'profesional', 'segunda_feb': 'semi_profesional',
      'tercera_feb': 'semi_profesional', 'autonomica': 'semi_profesional', 'provincial': 'amateur',
      'cantera': 'cantera', 'amateur': 'amateur', 'semipro': 'semi_profesional',
      'semi_pro': 'semi_profesional', 'semi-pro': 'semi_profesional',
      'semi_profesional': 'semi_profesional', 'profesional': 'profesional',
      'juvenil': 'cantera', 'infantil': 'cantera',
    }
    
    // Sanitize text fields
    if (data.title) sanitizedData.title = sanitizeInput(data.title)
    if (data.description) sanitizedData.description = sanitizeMarkdown(data.description)
    if (data.requirements) sanitizedData.requirements = sanitizeMarkdown(data.requirements)
    if (data.benefits) sanitizedData.benefits = sanitizeMarkdown(data.benefits)
    if (data.tags) sanitizedData.tags = data.tags.map(tag => sanitizeInput(tag))
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

    const opportunity = await prisma.opportunity.update({
      where: { slug: params.slug },
      data: sanitizedData,
      include: { organization: { select: { name: true, slug: true, logo: true, verified: true } } },
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return PUT(request, { params })
}

// DELETE - Requiere ser autor, org owner, o admin
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: { organization: { select: { ownerId: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // ✅ CHECK DE PERMISOS
    const canDelete = 
      session.user.role === 'admin' ||
      existing.authorId === session.user.id ||
      existing.organization?.ownerId === session.user.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await prisma.opportunity.delete({ where: { slug: params.slug } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**RIESGOS:**
- ⚠️ Si `organization` es `null`, el check `existing.organization?.ownerId` puede pasar solo con `authorId`.

---

## 1.3 app/api/applications/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationCreateSchema } from '@/lib/validations'
import { sanitizeInput } from '@/lib/sanitize'
import { rateLimitByIP } from '@/lib/rate-limit'
import { sendApplicationNotificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET - Lista aplicaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit
    const state = searchParams.get('state')

    // ✅ Solo devuelve aplicaciones del usuario actual
    const where: any = { userId: session.user.id }
    if (state) where.state = state

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          opportunity: {
            select: {
              id: true, slug: true, title: true, type: true, level: true, city: true, status: true,
              organization: { select: { name: true, logo: true } },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      data: applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Crear nueva aplicación
export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000)

    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // ✅ Admins no pueden aplicar
    if (session.user.role === 'admin') {
      return NextResponse.json({ error: 'Administrators cannot apply to opportunities' }, { status: 403 })
    }

    const body = await request.json()
    const validation = applicationCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }

    const { opportunityId, message } = validation.data

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        organization: {
          include: { owner: { select: { email: true, name: true } } },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // ✅ Solo oportunidades publicadas
    if (opportunity.status !== 'publicada') {
      return NextResponse.json({ error: 'This opportunity is not accepting applications' }, { status: 400 })
    }

    // ✅ Check deadline
    if (opportunity.deadline && opportunity.deadline < new Date()) {
      return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
    }

    // ✅ Check duplicados
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_opportunityId: { userId: session.user.id, opportunityId },
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this opportunity' }, { status: 400 })
    }

    // Create application - DB usa default para state
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        opportunityId,
        message: sanitizeInput(message),
      },
      include: {
        user: { select: { name: true, email: true } },
        opportunity: { select: { title: true } },
      },
    })

    // Send notification email (non-blocking)
    if (opportunity.organization?.owner?.email) {
      try {
        await sendApplicationNotificationEmail(
          opportunity.organization.owner.email,
          application.user.name || 'Un candidato',
          opportunity.title,
          application.id
        )
      } catch (emailError) {
        console.error('Failed to send application notification email:', emailError)
      }
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno crítico. ✅ Bien protegido.

---

## 1.4 app/api/applications/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationUpdateSchema } from '@/lib/validations'
import { sendApplicationStateChangeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

interface Params { params: { id: string } }

// GET - Ver aplicación individual
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        opportunity: {
          select: {
            id: true, slug: true, title: true, type: true, level: true, city: true, organizationId: true,
            organization: { select: { name: true, ownerId: true } },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // ✅ CHECK DE PERMISOS - aplicante OR org.owner OR admin
    const canView = 
      session.user.role === 'admin' ||
      application.userId === session.user.id ||
      application.opportunity.organization?.ownerId === session.user.id

    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Cambiar estado de aplicación (solo org owner o admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        opportunity: {
          select: {
            title: true, organizationId: true,
            organization: { select: { ownerId: true } },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // ✅ Solo org owner o admin pueden cambiar estado
    const canUpdate = 
      session.user.role === 'admin' ||
      application.opportunity.organization?.ownerId === session.user.id

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = applicationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }

    const { state } = validation.data
    const previousState = application.state

    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { state },
      include: {
        user: { select: { name: true, email: true } },
        opportunity: { select: { title: true } },
      },
    })

    // Send notification email
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**RIESGOS:**
- ⚠️ MEDIO: Si `organization` es `null`, nadie excepto admin puede cambiar el estado.

---

## 1.5 app/api/admin/opportunities/[opportunityId]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Params { params: { opportunityId: string } }

// PATCH - Aprobar/rechazar oportunidad (SOLO ADMIN)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // ✅ SOLO ADMIN
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ['publicada', 'borrador', 'cerrada', 'rechazada']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: publicada, borrador, cerrada, rechazada' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    
    if (status === 'publicada') {
      updateData.publishedAt = new Date()
    }
    
    if (status === 'borrador' || status === 'rechazada') {
      updateData.publishedAt = null
    }
    
    const opportunity = await prisma.opportunity.update({
      where: { id: params.opportunityId },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno. ✅ Solo admin.

---

## 1.6 app/api/admin/import/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ImportResult {
  success: number
  errors: number
  details: string[]
}

function parseCSV(text: string): any[] {
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const firstLine = lines[0]
  const delimiter = firstLine.includes(';') ? ';' : ','
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''))
  
  return lines.slice(1).map((line, index) => {
    let values: string[]
    if (line.includes('"') || line.includes("'")) {
      const regex = delimiter === ';' 
        ? /(?:^|;)(?:"([^"]*)"|'([^']*)'|([^;]*))/g
        : /(?:^|,)(?:"([^"]*)"|'([^']*)'|([^,]*))/g
      values = []
      let match
      while ((match = regex.exec(line)) !== null) {
        values.push((match[1] || match[2] || match[3] || '').trim())
      }
    } else {
      values = line.split(delimiter).map(v => v.trim())
    }
    
    const row: any = { _rowNumber: index + 2 }
    headers.forEach((header, i) => { row[header] = values[i] || '' })
    return row
  })
}

async function importJugadores(rows: any[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: 0, details: [] }

  for (const row of rows) {
    try {
      const email = row.email
      if (!email || !email.includes('@')) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email inválido`)
        continue
      }

      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email ${email} ya existe`)
        continue
      }

      const user = await prisma.user.create({
        data: { email, name: row.nombre_completo || 'Usuario', role: 'jugador' },
      })

      let birthDate = new Date('2000-01-01')
      if (row.fecha_nacimiento?.trim()) {
        const parsed = new Date(row.fecha_nacimiento)
        if (!isNaN(parsed.getTime())) birthDate = parsed
      }
      
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          fullName: row.nombre_completo || 'Sin nombre',
          birthDate,
          role: 'jugador',
          city: row.ciudad || 'Madrid',
          country: row.pais || 'España',
          position: row.posicion || null,
          height: row.altura ? parseInt(row.altura) : null,
          weight: row.peso ? parseInt(row.peso) : null,
          currentLevel: row.nivel_actual || 'Amateur',
        },
      })

      result.success++
    } catch (error: any) {
      result.errors++
      result.details.push(`Fila ${row._rowNumber}: ${error.message}`)
    }
  }
  return result
}

// ... (funciones similares para entrenadores, clubes, ofertas)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // ✅ SOLO ADMIN
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Archivo CSV vacío o inválido' }, { status: 400 })
    }

    // ✅ Límite de filas
    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Máximo 1000 filas permitidas' }, { status: 400 })
    }

    let result: ImportResult

    switch (type) {
      case 'jugadores': result = await importJugadores(rows); break
      case 'entrenadores': result = await importEntrenadores(rows); break
      case 'clubes': result = await importClubes(rows); break
      case 'ofertas': result = await importOfertas(rows); break
      default: return NextResponse.json({ error: 'Tipo de importación inválido' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al procesar importación', details: error.message }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno crítico. ✅ Solo admin.

---

## 1.7 app/api/user/update/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // ✅ Solo puede actualizar su propio usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData
    })

    return NextResponse.json({
      message: 'Perfil actualizado correctamente',
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
```

**RIESGOS:**
- ⚠️ BAJO: No permite cambiar `role` ni `planType` - correcto.

---

## 1.8 app/api/notifications/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener notificaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // ✅ Solo notificaciones propias
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener notificaciones', notifications: [], unreadCount: 0 }, { status: 500 })
  }
}

// POST - Marcar notificación como leída
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { notificationId } = await request.json()
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId requerido' }, { status: 400 })
    }

    // ✅ Verificar propiedad
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 })
    }

    await prisma.notification.update({ where: { id: notificationId }, data: { read: true } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al marcar notificación' }, { status: 500 })
  }
}

// PATCH - Marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // ✅ Solo propias
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al marcar todas como leídas' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno. ✅ Bien protegido.

---

## 1.9 app/api/favorites/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const favoriteSchema = z.object({
  opportunityId: z.string().cuid(),
})

// POST - Agregar a favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { opportunityId } = favoriteSchema.parse(body)

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } })
    if (!opportunity) {
      return NextResponse.json({ message: 'Oportunidad no encontrada' }, { status: 404 })
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } }
    })

    if (existingFavorite) {
      return NextResponse.json({ message: 'Ya está en favoritos' }, { status: 400 })
    }

    // ✅ Usa session.user.id
    const favorite = await prisma.favorite.create({
      data: { userId: session.user.id, opportunityId }
    })

    return NextResponse.json({ message: 'Agregado a favoritos', favorite })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar de favoritos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { opportunityId } = favoriteSchema.parse(body)

    // ✅ Solo puede eliminar sus propios favoritos
    await prisma.favorite.delete({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } }
    })

    return NextResponse.json({ message: 'Eliminado de favoritos' })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // ✅ Solo favoritos propios
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { opportunity: { include: { organization: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno. ✅ Bien protegido.

---

## 1.10 app/api/stripe/create-checkout/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createSubscriptionCheckout, createOneTimeCheckout } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  planType: z.enum(['pro_semipro', 'destacado']),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  returnUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)
    const { planType, billingCycle, returnUrl } = validatedData

    // ✅ Verificar suscripción existente
    const { prisma } = await import('@/lib/prisma')
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: 'active', planType: planType }
    })

    if (existingSubscription) {
      return NextResponse.json({ 
        message: 'Ya tienes una suscripción activa a este plan',
        error: 'ALREADY_SUBSCRIBED'
      }, { status: 400 })
    }

    const origin = returnUrl || request.headers.get('origin') || process.env.APP_URL
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/planes`

    let checkoutSession

    if (planType === 'pro_semipro') {
      checkoutSession = await createSubscriptionCheckout(
        session.user.id, session.user.email, planType, successUrl, cancelUrl, billingCycle || 'monthly'
      )
    } else if (planType === 'destacado') {
      checkoutSession = await createOneTimeCheckout(
        session.user.id, session.user.email, planType, successUrl, cancelUrl
      )
    } else {
      return NextResponse.json({ message: 'Plan no válido' }, { status: 400 })
    }

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
```

**RIESGOS:** Ninguno crítico. ✅ Usa session.user.id.

---

# 2. AUTORIZACIÓN / HELPERS

## 2.1 lib/auth.ts

```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
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

          // 🚨 VULNERABILIDAD CRÍTICA: NO VALIDA PASSWORD
          // En producción debería ser:
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
        if (token.image) session.user.image = token.image as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
        ;(token as any).planType = (user as any).planType
        if (user.image) token.image = user.image
      }
      return token
    },
  },
}
```

**🚨 RIESGO CRÍTICO:** `compare` importado pero NO usado. Cualquier password funciona.

---

## 2.2 lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' })
  const diffInSeconds = (dateObj.getTime() - Date.now()) / 1000
  const diffInDays = diffInSeconds / 86400
  const diffInHours = diffInSeconds / 3600
  const diffInMinutes = diffInSeconds / 60
  
  if (Math.abs(diffInDays) >= 1) return rtf.format(Math.round(diffInDays), 'day')
  if (Math.abs(diffInHours) >= 1) return rtf.format(Math.round(diffInHours), 'hour')
  return rtf.format(Math.round(diffInMinutes), 'minute')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Labels y colors para UI - NO son helpers de permisos
export function getOpportunityTypeLabel(type: string): string { /* ... */ }
export function getOpportunityLevelLabel(level: string): string { /* ... */ }
export function getApplicationStateLabel(state: string): string { /* ... */ }
export function getApplicationStateColor(state: string): string { /* ... */ }
export function getOpportunityTypeColor(type: string): string { /* ... */ }
```

**NOTA:** `lib/utils.ts` NO contiene helpers de permisos. Los checks se hacen inline en cada route.

---

## 2.3 Helpers de Permisos (NO EXISTEN CENTRALIZADOS)

El proyecto **NO tiene helpers centralizados** para:
- `isAdmin()`
- `isOwner()`
- `requireAuth()`
- `requireRole()`

Todos los checks se hacen **inline** en cada route con:
```typescript
// Check auth
const session = await getServerSession(authOptions)
if (!session?.user?.id) { return 401 }

// Check admin
if (session.user.role !== 'admin') { return 403 }

// Check owner
const canEdit = session.user.role === 'admin' || existing.authorId === session.user.id
```

**RECOMENDACIÓN:** Crear helpers centralizados.

---

# 3. MIDDLEWARE Y PROTECCIÓN DE RUTAS

## 3.1 Estado Actual

```
⚠️ NO EXISTE middleware.ts EN EL PROYECTO
```

Toda la protección se hace en cada API route individualmente.

---

## 3.2 MIDDLEWARE RECOMENDADO

```typescript
// middleware.ts (CREAR EN /app/middleware.ts)
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/profile', '/publicar']

// Rutas que requieren rol admin
const adminRoutes = ['/admin']

// Rutas públicas (no redirigir si está autenticado)
const publicAuthRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si está autenticado y va a login/register, redirigir a dashboard
  if (token && publicAuthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Verificar rutas protegidas
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Si no tiene token y es ruta protegida, redirigir a login
  if (!token && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si es ruta admin y no es admin, redirigir a dashboard
  if (isAdminRoute && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/publicar/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
```

**Cómo validar rol admin en /admin:**
1. El middleware lee el JWT con `getToken()`
2. El token contiene `role` (añadido en `jwt` callback de auth.ts)
3. Si `token.role !== 'admin'`, redirige a `/dashboard`
4. Las API routes de `/api/admin/*` también verifican `session.user.role === 'admin'`
5. Doble capa de protección: middleware + API

---

# 4. MAPA DE PERMISOS (TABLA)

| Endpoint | Sesión | Rol | Check Actual | Riesgo | Fix |
|----------|--------|-----|--------------|--------|-----|
| `GET /api/opportunities` | ❌ | - | Ninguno | BAJO | OK |
| `POST /api/opportunities` | ✅ | - | `session.user.id` + límites plan | BAJO | OK |
| `GET /api/opportunities/[slug]` | Parcial | - | Oculta no-publicadas | BAJO | OK |
| `PUT /api/opportunities/[slug]` | ✅ | - | `author OR org.owner OR admin` | MEDIO | Verificar org no null |
| `DELETE /api/opportunities/[slug]` | ✅ | - | `author OR org.owner OR admin` | MEDIO | Verificar org no null |
| `GET /api/applications` | ✅ | - | `userId = session.user.id` | BAJO | OK |
| `POST /api/applications` | ✅ | - | Rate limit + duplicados + deadline | BAJO | OK |
| `GET /api/applications/[id]` | ✅ | - | `applicant OR org.owner OR admin` | MEDIO | Verificar org no null |
| `PATCH /api/applications/[id]` | ✅ | - | `org.owner OR admin` | MEDIO | Verificar org no null |
| `PATCH /api/admin/opportunities/[id]` | ✅ | admin | `role === 'admin'` | BAJO | OK |
| `POST /api/admin/import` | ✅ | admin | `role === 'admin'` | BAJO | OK |
| `PUT /api/user/update` | ✅ | - | Solo propio user | BAJO | OK |
| `GET /api/notifications` | ✅ | - | Solo propias | BAJO | OK |
| `POST /api/notifications` | ✅ | - | Verifica propiedad | BAJO | OK |
| `GET /api/favorites` | ✅ | - | Solo propios | BAJO | OK |
| `POST /api/favorites` | ✅ | - | Usa session.user.id | BAJO | OK |
| `DELETE /api/favorites` | ✅ | - | Usa session.user.id | BAJO | OK |
| `POST /api/stripe/create-checkout` | ✅ | - | Verifica suscripción existente | BAJO | OK |
| `POST /api/stripe/webhook` | ❌ | - | Firma de Stripe | BAJO | OK |
| `POST /api/auth/register` | ❌ | - | Validación Zod | ALTO | Añadir rate limit |
| `POST /api/auth/[...nextauth]` | ❌ | - | Busca user | 🚨CRÍTICO | Validar password |

---

# 5. PRUEBAS RÁPIDAS DE SEGURIDAD (10 TEST CASES)

## Test 1: Editar oportunidad ajena (sin ser admin)
```bash
# Login como user A, intentar editar oportunidad de user B
curl -X PUT https://workhoops.com/api/opportunities/oportunidad-de-otro-usuario \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_USER_A" \
  -d '{"title": "Hackeado"}'

# Esperado: 403 Insufficient permissions
# Actual: ???
```

## Test 2: Borrar oportunidad ajena
```bash
curl -X DELETE https://workhoops.com/api/opportunities/oportunidad-de-otro-usuario \
  -H "Cookie: next-auth.session-token=TOKEN_USER_A"

# Esperado: 403 Insufficient permissions
```

## Test 3: Cambiar estado de aplicación ajena
```bash
# User A intenta cambiar estado de aplicación en oportunidad de user B
curl -X PATCH https://workhoops.com/api/applications/APPLICATION_ID_AJENO \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_USER_A" \
  -d '{"state": "aceptada"}'

# Esperado: 403 Insufficient permissions
```

## Test 4: Leer aplicación ajena por ID
```bash
curl -X GET https://workhoops.com/api/applications/APPLICATION_ID_AJENO \
  -H "Cookie: next-auth.session-token=TOKEN_USER_A"

# Esperado: 403 o 404
```

## Test 5: Crear oportunidad sin sesión
```bash
curl -X POST https://workhoops.com/api/opportunities \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "type": "empleo", "level": "amateur", "description": "x".repeat(50), "city": "Madrid", "contactEmail": "test@test.com"}'

# Esperado: 401 No autorizado
```

## Test 6: Bypass límite de plan (crear 2+ oportunidades con plan free)
```bash
# Crear primera oportunidad (OK)
# Crear segunda oportunidad
curl -X POST https://workhoops.com/api/opportunities \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_USER_FREE" \
  -d '{"title": "Segunda oferta", ...}'

# Esperado: 403 "Ya tienes una oferta publicada"
```

## Test 7: Acceder a panel admin sin ser admin
```bash
curl -X PATCH https://workhoops.com/api/admin/opportunities/OPPORTUNITY_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_USER_NORMAL" \
  -d '{"status": "publicada"}'

# Esperado: 403 Admin access required
```

## Test 8: Importar CSV sin ser admin
```bash
curl -X POST https://workhoops.com/api/admin/import \
  -H "Cookie: next-auth.session-token=TOKEN_USER_NORMAL" \
  -F "file=@jugadores.csv" \
  -F "type=jugadores"

# Esperado: 403 No autorizado
```

## Test 9: Login con password incorrecto
```bash
curl -X POST https://workhoops.com/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@existente.com", "password": "password_incorrecto_123"}'

# Esperado: 401 Credenciales inválidas
# 🚨 ACTUAL: Probablemente 200 OK (BUG)
```

## Test 10: Marcar notificación de otro usuario como leída
```bash
curl -X POST https://workhoops.com/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN_USER_A" \
  -d '{"notificationId": "NOTIFICATION_ID_DE_USER_B"}'

# Esperado: 404 Notificación no encontrada (porque verifica userId)
```

---

# RESUMEN DE VULNERABILIDADES CRÍTICAS

| # | Severidad | Descripción | Archivo | Línea |
|---|-----------|-------------|---------|-------|
| 1 | 🚨 CRÍTICA | Password no validado | `lib/auth.ts` | ~35 |
| 2 | 🚨 CRÍTICA | Backdoor admin por email | `api/auth/register/route.ts` | 45 |
| 3 | ⚠️ ALTA | Sin middleware global | `middleware.ts` | NO EXISTE |
| 4 | ⚠️ MEDIA | Rate limit en memoria | `lib/rate-limit.ts` | ALL |
| 5 | ⚠️ MEDIA | Sin rate limit en registro | `api/auth/register/route.ts` | ALL |

---

**Documento generado: 26/02/2026**
