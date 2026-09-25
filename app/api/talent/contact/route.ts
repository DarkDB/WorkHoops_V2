import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitByUser, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'
import { trackFunnelEvent } from '@/lib/funnel-events'
import { canContactTalent, selectPublicContactTarget } from '@/lib/agency-pilot-safety'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  profileId: z.string(),
  profileUserId: z.string(),
  contactName: z.string().min(1, 'Nombre requerido'),
  contactEmail: z.string().email('Email inválido'),
  contactMessage: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!canContactTalent(session.user.role)) {
      return NextResponse.json(
        { message: 'Solo clubes y agencias pueden contactar perfiles de talento' },
        { status: 403 }
      )
    }

    // Rate limiting: 5 contact requests per user per hour
    const rateLimitResult = await rateLimitByUser(
      session.user.id,
      5,
      60 * 60 * 1000 // 1 hour
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          message: 'Demasiadas solicitudes de contacto',
          detail: `Has alcanzado el límite de ${rateLimitResult.limit} solicitudes por hora. Intenta de nuevo más tarde.`,
          resetAt: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const body = await request.json()
    const { profileId, profileUserId, contactName, contactEmail, contactMessage } = contactSchema.parse(body)

    const player = await prisma.talentProfile.findUnique({
      where: { id: profileId },
      select: {
        fullName: true,
        isPublic: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    const coach = player ? null : await prisma.coachProfile.findUnique({
      where: { id: profileId },
      select: {
        fullName: true,
        isPublic: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    const target = selectPublicContactTarget(player, coach, profileUserId)
    if (!target) {
      return NextResponse.json(
        { message: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    const profile = target.profile

    if (session.user.id === profile.user.id) {
      return NextResponse.json(
        { message: 'No puedes enviarte una solicitud de contacto a ti mismo' },
        { status: 400 }
      )
    }

    // An email failure must not be reported as a successful contact.
    try {
      const { sendTalentContactEmail } = await import('@/lib/email')
      const profileUrl = `${process.env.APP_URL || 'https://workhoops.es'}/talento/perfiles/${profileId}`
      
      await sendTalentContactEmail(
        profile.user.email!,
        profile.user.name || profile.fullName,
        contactName,
        contactEmail,
        contactMessage,
        profileUrl
      )
    } catch (emailError) {
      console.error('Error sending contact email:', emailError)
      return NextResponse.json({ message: 'No se pudo enviar la solicitud de contacto' }, { status: 502 })
    }

    // Shortlists only support players; coach contact remains email-only.
    if (target.kind === 'player') {
      const existingShortlist = await prisma.talentShortlist.findUnique({
        where: {
          clubUserId_talentProfileId: {
            clubUserId: session.user.id,
            talentProfileId: profileId
          }
        }
      })

      if (!existingShortlist) {
        await prisma.talentShortlist.create({
          data: {
            clubUserId: session.user.id,
            talentProfileId: profileId,
            status: 'CONTACTED',
            lastStatusAt: new Date()
          }
        })
      } else if (existingShortlist.status === 'SAVED' || existingShortlist.status === 'CONTACTED') {
        await prisma.talentShortlist.update({
          where: { id: existingShortlist.id },
          data: {
            status: 'CONTACTED',
            lastStatusAt: new Date()
          }
        })
      }
    }

    // You could create a ContactRequest model to store these in the database
    // await prisma.contactRequest.create({
    //   data: {
    //     contactName,
    //     contactEmail,
    //     contactMessage,
    //     profileId,
    //     status: 'sent'
    //   }
    // })

    if (target.kind === 'player') {
      await trackFunnelEvent({
        eventName: 'talent_contacted',
        userId: session.user.id,
        role: session.user.role,
        metadata: { profileId }
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de contacto enviada. El usuario recibirá tu mensaje por email.'
      },
      {
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error contacting talent:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
