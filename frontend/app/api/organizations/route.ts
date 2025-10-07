import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { organizationCreateSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/utils'
import { sanitizeInput } from '@/lib/sanitize'
import { rateLimitByIP } from '@/lib/rate-limit'

// GET /api/organizations - List organizations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const search = searchParams.get('search')
    const verified = searchParams.get('verified')

    const where: any = {}
    
    if (search) {
      where.name = { contains: sanitizeInput(search), mode: 'insensitive' }
    }
    
    if (verified === 'true') {
      where.verified = true
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              opportunities: {
                where: { status: 'publicada' }
              },
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ])

    return NextResponse.json({
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get organizations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 2, 60 * 1000) // 2 requests per minute

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

    // Check if user already has an organization (limit one per user for now)
    if (session.user.role === 'org') {
      const existing = await prisma.organization.findFirst({
        where: { ownerId: session.user.id },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'You already have an organization' },
          { status: 400 }
        )
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = organizationCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Generate unique slug
    let baseSlug = generateSlug(data.name)
    let slug = baseSlug
    let counter = 1

    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput(data.name),
      bio: data.bio ? sanitizeInput(data.bio) : null,
      logo: data.logoUrl || null,
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        ...sanitizedData,
        slug,
        ownerId: session.user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'created',
        entity: 'organization',
        entityId: organization.id,
        metadata: JSON.stringify({
          name: organization.name,
          slug: organization.slug,
        }),
      },
    })

    return NextResponse.json(organization, { status: 201 })

  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}