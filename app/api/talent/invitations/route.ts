import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { trackFunnelEvent } from '@/lib/funnel-events'

export const dynamic = 'force-dynamic'

const invitationSchema = z.object({
  profileId: z.string().cuid(),
  type: z.enum(['INVITE_TO_APPLY', 'INVITE_TO_TRYOUT']),
  message: z.string().max(500).optional()
})

const roleAllowed = (role?: string) => role === 'club' || role === 'agencia' || role === 'admin'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (!roleAllowed(session.user.role)) {
      return NextResponse.json({ message: 'Solo clubes y agencias pueden invitar jugadores' }, { status: 403 })
    }

    const body = await request.json()
    const { profileId, type, message } = invitationSchema.parse(body)

    const talentProfile = await prisma.talentProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        role: true,
        fullName: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!talentProfile || talentProfile.role !== 'jugador') {
      return NextResponse.json({ message: 'Jugador no encontrado' }, { status: 404 })
    }

    const shortlist = await prisma.talentShortlist.upsert({
      where: {
        clubUserId_talentProfileId: {
          clubUserId: session.user.id,
          talentProfileId: profileId
        }
      },
      create: {
        clubUserId: session.user.id,
        talentProfileId: profileId,
        status: 'INVITED',
        lastStatusAt: new Date()
      },
      update: {
        status: 'INVITED',
        lastStatusAt: new Date()
      }
    })

    const invitation = await prisma.talentInvitation.create({
      data: {
        shortlistId: shortlist.id,
        clubUserId: session.user.id,
        talentProfileId: profileId,
        type,
        status: 'SENT',
        message: message || null
      }
    })

    await createNotification({
      userId: talentProfile.userId,
      type: 'message_received',
      title: 'Nueva invitación de club',
      message: `${session.user.name || 'Un club'} te envió una invitación (${type === 'INVITE_TO_APPLY' ? 'Aplicar' : 'Tryout'})`,
      link: `/talento/perfiles/${profileId}`
    })

    try {
      const { sendTalentInvitationEmail } = await import('@/lib/email')
      await sendTalentInvitationEmail(
        talentProfile.user.email || '',
        talentProfile.user.name || talentProfile.fullName,
        session.user.name || 'Un club',
        type,
        message || null,
        `${process.env.APP_URL || 'https://workhoops.es'}/talento/perfiles/${profileId}`
      )
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
    }

    await trackFunnelEvent({
      eventName: 'invitation_sent',
      userId: session.user.id,
      role: session.user.role,
      metadata: {
        profileId,
        type
      }
    })

    return NextResponse.json({
      message: 'Invitación enviada',
      invitation,
      shortlistStatus: shortlist.status
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    console.error('Error sending invitation:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const profileId = request.nextUrl.searchParams.get('profileId')
    if (!profileId) {
      return NextResponse.json({ message: 'profileId es requerido' }, { status: 400 })
    }

    const where: any = session.user.role === 'jugador' || session.user.role === 'entrenador'
      ? { talentProfileId: profileId, talentProfile: { userId: session.user.id } }
      : { clubUserId: session.user.id, talentProfileId: profileId }

    const invitations = await prisma.talentInvitation.findMany({
      where,
      include: {
        clubUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
