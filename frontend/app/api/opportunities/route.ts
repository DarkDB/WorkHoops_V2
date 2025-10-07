import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { opportunityCreateSchema } from '@/lib/validations'
import { generateSlug, sanitizeMarkdown, sanitizeInput } from '@/lib/sanitize'
import { rateLimitByIP } from '@/lib/rate-limit'
import { z } from 'zod'

// GET /api/opportunities - List opportunities with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const type = searchParams.get('type')
    const level = searchParams.get('level')
    const city = searchParams.get('city')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      status: 'publicada',
      publishedAt: { not: null },
    }

    if (type) where.type = type
    if (level) where.level = level
    if (city) where.city = { contains: city, mode: 'insensitive' }
    
    if (search) {
      const sanitizedSearch = sanitizeInput(search)
      where.OR = [
        { title: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        { tags: { hasSome: [sanitizedSearch] } },
      ]
    }

    // Execute query
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        include: {
          organization: {
            select: {
              name: true,
              slug: true,
              logoUrl: true,
              verified: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ])

    return NextResponse.json({
      data: opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get opportunities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/opportunities - Create new opportunity
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 3, 60 * 1000) // 3 requests per minute

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!['org', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = opportunityCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify organization ownership for non-admin users
    if (session.user.role === 'org') {
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
        select: { ownerId: true },
      })

      if (!organization || organization.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only create opportunities for your own organization' },
          { status: 403 }
        )
      }
    }

    // Generate unique slug
    let baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let counter = 1

    while (await prisma.opportunity.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Sanitize content
    const sanitizedData = {
      ...data,
      title: sanitizeInput(data.title),
      description: sanitizeMarkdown(data.description),
      requirements: data.requirements ? sanitizeMarkdown(data.requirements) : null,
      benefits: data.benefits ? sanitizeMarkdown(data.benefits) : null,
      tags: data.tags.map(tag => sanitizeInput(tag)),
    }

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        ...sanitizedData,
        slug,
        createdBy: session.user.id,
        // Default to draft status - will be published after payment
        status: 'borrador',
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            verified: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'created',
        entity: 'opportunity',
        entityId: opportunity.id,
        metadata: {
          title: opportunity.title,
          type: opportunity.type,
          organizationId: opportunity.organizationId,
        },
      },
    })

    return NextResponse.json(opportunity, { status: 201 })

  } catch (error) {
    console.error('Create opportunity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}