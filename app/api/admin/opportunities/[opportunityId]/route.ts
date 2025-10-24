import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Params {
  params: {
    opportunityId: string
  }
}

// PATCH /api/admin/opportunities/[opportunityId] - Update opportunity status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['publicada', 'borrador', 'cerrada', 'rechazada']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: publicada, borrador, cerrada, rechazada' },
        { status: 400 }
      )
    }

    // Update opportunity status
    const opportunity = await prisma.opportunity.update({
      where: { id: params.opportunityId },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send notification email to author about status change
    // if (status === 'publicada') {
    //   await sendEmail({
    //     to: opportunity.author.email,
    //     subject: 'Tu oferta ha sido aprobada',
    //     ...
    //   })
    // }

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Admin update opportunity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
