import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const opportunityCreateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  type: z.string(),
  level: z.string(),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  city: z.string(),
  country: z.string().default('España'),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  remunerationMin: z.string().optional(),
  remunerationMax: z.string().optional(),
  remunerationType: z.string().default('mensual'),
  contactEmail: z.string().email('Email de contacto inválido'),
  contactPhone: z.string().optional(),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
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
    const validatedData = opportunityCreateSchema.parse(body)

    // Get user's current opportunities count
    const userOpportunities = await prisma.opportunity.count({
      where: {
        authorId: session.user.id,
        status: { in: ['borrador', 'publicada'] }
      }
    })

    // Check limits based on featured status
    if (validatedData.featured) {
      // Featured: up to 3 opportunities
      if (userOpportunities >= 3) {
        return NextResponse.json(
          { message: 'Has alcanzado el límite de 3 ofertas destacadas. Elimina una oferta existente o espera a que expiren.' },
          { status: 403 }
        )
      }
    } else {
      // Free: only 1 opportunity
      if (userOpportunities >= 1) {
        return NextResponse.json(
          { message: 'Ya tienes una oferta publicada. Con el plan gratis solo puedes tener 1 oferta activa. Actualiza a pack destacado para publicar hasta 3 ofertas.' },
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

    // Calculate plan end date based on featured status
    const planEnd = new Date()
    if (validatedData.featured) {
      planEnd.setDate(planEnd.getDate() + 60) // 60 days for featured
    } else {
      planEnd.setDate(planEnd.getDate() + 30) // 30 days for free
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
        featured: validatedData.featured,
        status: 'publicada' as any,
        publishedAt: new Date(),
        planEnd,
        authorId: session.user.id,
        organizationId: organization.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Oportunidad creada exitosamente',
      opportunity
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { message: 'Error al crear oportunidad' },
      { status: 500 }
    )
  }
}