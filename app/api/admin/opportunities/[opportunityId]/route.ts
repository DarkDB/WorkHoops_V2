import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

interface Params {
  params: {
    opportunityId: string
  }
}

const opportunityStatusSchema = z.enum([
  'borrador',
  'pendiente',
  'publicada',
  'cerrada',
  'suspendida',
])

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
    const parsedStatus = opportunityStatusSchema.safeParse(body.status)
    if (!parsedStatus.success) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: borrador, pendiente, publicada, cerrada, suspendida' },
        { status: 400 }
      )
    }
    const status = parsedStatus.data

    // Update opportunity status
    const updateData: { status: typeof status; publishedAt?: Date | null } = { status }
    
    // Si se está aprobando (cambiando a publicada), establecer publishedAt
    if (status === 'publicada') {
      updateData.publishedAt = new Date()
    }
    
    // Estados no públicos no deben conservar una fecha de publicación activa.
    if (status === 'borrador' || status === 'pendiente' || status === 'suspendida') {
      updateData.publishedAt = null
    }
    
    const opportunity = await prisma.opportunity.update({
      where: { id: params.opportunityId },
      data: updateData,
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
