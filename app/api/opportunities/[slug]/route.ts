






import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { opportunityCreateSchema, opportunityUpdateSchema } from '@/lib/validations'
import { sanitizeMarkdown, sanitizeInput } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

interface Params {
  params: {
    slug: string
  }
}

// GET /api/opportunities/[slug] - Get single opportunity
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
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
            favorites: true,
          },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Only show published opportunities to public
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === opportunity.authorId
    const isAdmin = session?.user?.role === 'admin'

    if (opportunity.status !== 'publicada' && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Get opportunity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT/PATCH /api/opportunities/[slug] - Update opportunity
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get existing opportunity
    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: {
          select: { ownerId: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canEdit = 
      session.user.role === 'admin' ||
      existing.authorId === session.user.id ||
      existing.organization.ownerId === session.user.id

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    console.log('Update opportunity - Received data:', JSON.stringify(body, null, 2))
    
    // Use the update schema (all fields optional)
    const validation = opportunityUpdateSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Prepare data for database update
    const sanitizedData: any = {}
    
    // Mapeo de valores del formulario a valores de Prisma
    // Prisma solo soporta: amateur, semi_profesional, profesional, cantera
    const levelMap: Record<string, string> = {
      // Nuevas categorías 2025
      'acb': 'profesional',
      'primera_feb': 'profesional',
      'segunda_feb': 'semi_profesional',
      'tercera_feb': 'semi_profesional',
      'autonomica': 'semi_profesional',
      'provincial': 'amateur',
      'cantera': 'cantera',
      'amateur': 'amateur',
      
      // Legacy values
      'semipro': 'semi_profesional',
      'semi_pro': 'semi_profesional',
      'semi-pro': 'semi_profesional',
      'semi_profesional': 'semi_profesional',
      'profesional': 'profesional',
      'juvenil': 'cantera',
      'infantil': 'cantera',
    }
    
    // Sanitize text fields
    if (data.title) sanitizedData.title = sanitizeInput(data.title)
    if (data.description) sanitizedData.description = sanitizeMarkdown(data.description)
    if (data.requirements) sanitizedData.requirements = sanitizeMarkdown(data.requirements)
    if (data.benefits) sanitizedData.benefits = sanitizeMarkdown(data.benefits)
    if (data.tags) sanitizedData.tags = data.tags.map(tag => sanitizeInput(tag))
    
    // Handle simple fields
    if (data.type) sanitizedData.type = data.type
    if (data.level) {
      // Mapear el nivel del formulario al valor correcto de Prisma
      sanitizedData.level = levelMap[data.level] || data.level
    }
    if (data.city) sanitizedData.city = data.city
    if (data.country) sanitizedData.country = data.country
    if (data.contactEmail) sanitizedData.contactEmail = data.contactEmail
    if (data.contactPhone) sanitizedData.contactPhone = data.contactPhone
    if (data.applicationUrl !== undefined) {
      // Permitir string vacío, convertirlo a null
      sanitizedData.applicationUrl = data.applicationUrl === '' ? null : data.applicationUrl
    }
    
    // Handle dates
    if (data.deadline) {
      sanitizedData.deadline = typeof data.deadline === 'string' ? new Date(data.deadline) : data.deadline
    }
    if (data.startDate) {
      sanitizedData.startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate
    }
    
    // Handle remuneration fields (support both old and new format)
    if (data.remunerationType) sanitizedData.remunerationType = data.remunerationType
    if (data.remunerationMin !== undefined) {
      sanitizedData.remunerationMin = typeof data.remunerationMin === 'string' 
        ? (data.remunerationMin === '' ? null : parseFloat(data.remunerationMin))
        : data.remunerationMin
    }
    if (data.remunerationMax !== undefined) {
      sanitizedData.remunerationMax = typeof data.remunerationMax === 'string'
        ? (data.remunerationMax === '' ? null : parseFloat(data.remunerationMax))
        : data.remunerationMax
    }

    console.log('Update opportunity - Sanitized data:', JSON.stringify(sanitizedData, null, 2))

    // Update opportunity
    const opportunity = await prisma.opportunity.update({
      where: { slug: params.slug },
      data: sanitizedData,
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logo: true,
            verified: true,
          },
        },
      },
    })

    // Create audit log
    // TODO: Audit log
    /*
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'updated',
        entity: 'opportunity',
        entityId: opportunity.id,
        metadata: JSON.stringify({
          updatedFields: Object.keys(sanitizedData),
        }),
      },
    })
    */

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Update opportunity error:', error)
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      // Error de validación de Prisma
      if (error.message.includes('Invalid value for argument')) {
        return NextResponse.json(
          { 
            error: 'Error de validación',
            message: 'Los datos proporcionados no son válidos. Por favor, revisa los campos.',
            details: error.message
          },
          { status: 400 }
        )
      }
      
      // Error genérico
      return NextResponse.json(
        { 
          error: 'Error al actualizar la oferta',
          message: error.message 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


// PATCH uses the same logic as PUT
export async function PATCH(request: NextRequest, { params }: Params) {
  return PUT(request, { params })
}

// DELETE /api/opportunities/[slug] - Delete opportunity
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get existing opportunity
    const existing = await prisma.opportunity.findUnique({
      where: { slug: params.slug },
      include: {
        organization: {
          select: { ownerId: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canDelete = 
      session.user.role === 'admin' ||
      existing.authorId === session.user.id ||
      existing.organization.ownerId === session.user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete opportunity (cascade will handle related records)
    await prisma.opportunity.delete({
      where: { slug: params.slug },
    })

    // Create audit log
    // TODO: Audit log
    /*
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'deleted',
        entity: 'opportunity',
        entityId: existing.id,
        metadata: JSON.stringify({
          title: existing.title,
        }),
      },
    })
    */

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete opportunity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
