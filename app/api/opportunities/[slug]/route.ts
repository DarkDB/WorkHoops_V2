import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { opportunityCreateSchema } from '@/lib/validations'
import { sanitizeMarkdown, sanitizeInput } from '@/lib/sanitize'

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

// PATCH /api/opportunities/[slug] - Update opportunity
export async function PATCH(request: NextRequest, { params }: Params) {
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
    
    // For updates, make all fields optional except what's being updated
    const updateSchema = opportunityCreateSchema.partial()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Sanitize content if provided
    const sanitizedData: any = {}
    if (data.title) sanitizedData.title = sanitizeInput(data.title)
    if (data.description) sanitizedData.description = sanitizeMarkdown(data.description)
    if (data.requirements) sanitizedData.requirements = sanitizeMarkdown(data.requirements)
    if (data.benefits) sanitizedData.benefits = sanitizeMarkdown(data.benefits)
    if (data.tags) sanitizedData.tags = data.tags.map(tag => sanitizeInput(tag))
    
    // Copy other fields as-is
    Object.keys(data).forEach(key => {
      if (!['title', 'description', 'requirements', 'benefits', 'tags'].includes(key)) {
        sanitizedData[key] = data[key]
      }
    })

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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