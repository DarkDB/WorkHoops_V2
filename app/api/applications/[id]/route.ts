






import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationUpdateSchema } from '@/lib/validations'
import { sendApplicationStateChangeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

interface Params {
  params: {
    id: string
  }
}

// GET /api/applications/[id] - Get single application
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
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
              select: {
                name: true,
                ownerId: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check permissions - user can see their own application, org can see applications to their opportunities
    const canView = 
      session.user.role === 'admin' ||
      application.userId === session.user.id ||
      application.opportunity.organization.ownerId === session.user.id

    if (!canView) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json(application)

  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/[id] - Update application state (org only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
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
            organizationId: true,
            organization: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check permissions - only org owner or admin can update application state
    const canUpdate = 
      session.user.role === 'admin' ||
      application.opportunity.organization.ownerId === session.user.id

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
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

    // Update application state
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { state },
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
    // TODO: Implement audit log when model is ready
    /*
    // TODO: Audit log
    /*
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'state_changed',
        entity: 'application',
        entityId: application.id,
        metadata: JSON.stringify({
          previousState,
          newState: state,
          opportunityTitle: application.opportunity.title,
        }),
      },
    })
    */

    // Send notification email to applicant if state changed significantly
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
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json(updatedApplication)

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
