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
        organization: {
          select: {
            name: true,
            verified: true,
          }
        },
        author: {
          select: {
            name: true,
          }
        },
        _count: {
          select: {
            applications: true,
            favorites: true,
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit,
    })

    const total = await prisma.opportunity.count({
      where: {
        status: 'publicada',
        publishedAt: { not: null },
      },
    })

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { message: 'Error fetching opportunities', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received opportunity data:', JSON.stringify(body, null, 2))
    
    const validatedData = opportunityCreateSchema.parse(body)

    // Get user's plan type from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true }
    })

    const userPlanType = user?.planType || 'gratis'
    console.log('User plan type:', userPlanType)

    // Get user's current opportunities count
    const userOpportunities = await prisma.opportunity.count({
      where: {
        authorId: session.user.id,
        status: { in: ['borrador', 'publicada'] }
      }
    })

    console.log('User has', userOpportunities, 'opportunities, plan:', userPlanType)

    // Check limits based on user's plan type
    // Plans: 'gratis' (1 oferta), 'pro' (3 ofertas), 'destacado' (3 ofertas)
    const isPremiumPlan = userPlanType === 'pro' || userPlanType === 'destacado'
    
    if (isPremiumPlan) {
      // Premium plans: up to 3 opportunities
      if (userOpportunities >= 3) {
        return NextResponse.json(
          { message: 'Has alcanzado el límite de 3 ofertas con tu plan. Elimina una oferta existente o espera a que expiren.' },
          { status: 403 }
        )
      }
    } else {
      // Free plan: only 1 opportunity
      if (userOpportunities >= 1) {
        return NextResponse.json(
          { message: 'Ya tienes una oferta publicada. Con el plan gratis solo puedes tener 1 oferta activa. Actualiza al plan Pro para publicar hasta 3 ofertas.' },
          { status: 403 }
        )
      }
    }

    // Get or create organization for the user
    let organization = await prisma.organization.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!organization) {
      // Create a default organization
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

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        title: validatedData.title,
        slug: validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: validatedData.type as any,
        level: validatedData.level as any,
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
        status: 'borrador' as any, // Nueva oferta en borrador para revisión del admin
        publishedAt: null, // No publicada hasta que el admin la apruebe
        authorId: session.user.id,
        organizationId: organization.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Oportunidad creada exitosamente. Está pendiente de revisión por el administrador.',
      opportunity
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json(
        { 
          message: 'Datos inválidos', 
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { message: 'Error al crear oportunidad', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}