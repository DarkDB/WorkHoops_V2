import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationCreateSchema } from '@/lib/validations'
import { sanitizeInput } from '@/lib/sanitize'
import { rateLimitByIP } from '@/lib/rate-limit'
import { sendApplicationNotificationEmail } from '@/lib/email'

// GET /api/applications - List user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit
    const state = searchParams.get('state')

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
              id: true,
              slug: true,
              title: true,
              type: true,
              level: true,
              city: true,
              status: true,
              organization: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000) // 5 applications per minute

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

    if (session.user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only users can apply to opportunities' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = applicationCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { opportunityId, message } = validation.data

    // Check if opportunity exists and is open for applications
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        organization: {
          include: {
            owner: {
              select: { email: true, name: true },
            },
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

    if (opportunity.status !== 'publicada') {
      return NextResponse.json(
        { error: 'This opportunity is not accepting applications' },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    if (opportunity.deadline && opportunity.deadline < new Date()) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      )
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_opportunityId: {
          userId: session.user.id,
          opportunityId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        opportunityId,
        message: sanitizeInput(message),
        state: 'enviada',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'applied',
        entity: 'application',
        entityId: application.id,
        metadata: {
          opportunityId,
          opportunityTitle: opportunity.title,
        },
      },
    })

    // Send notification email to organization
    if (opportunity.organization.owner.email) {
      try {
        await sendApplicationNotificationEmail(
          opportunity.organization.owner.email,
          application.user.name || 'Un candidato',
          opportunity.title,
          application.id
        )
      } catch (emailError) {
        console.error('Failed to send application notification email:', emailError)
        // Don't fail the application creation if email fails
      }
    }

    return NextResponse.json(application, { status: 201 })

  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}