import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitByUser, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const notifyInterestSchema = z.object({
  profileId: z.string(),
  profileUserId: z.string()
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

    // Rate limiting: 3 interest notifications per user per day
    const rateLimitResult = await rateLimitByUser(
      `interest_${session.user.id}`,
      3,
      24 * 60 * 60 * 1000 // 24 hours
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          message: 'Demasiadas notificaciones de interés',
          detail: `Has alcanzado el límite de ${rateLimitResult.limit} notificaciones por día. Intenta de nuevo mañana.`,
          resetAt: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const body = await request.json()
    const { profileId, profileUserId } = notifyInterestSchema.parse(body)

    // Fetch the profile
    const profile = await prisma.talentProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            planType: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { message: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // Check if user already has pro plan (shouldn't happen, but just in case)
    if (profile.user.planType === 'pro_semipro' || profile.user.planType === 'destacado') {
      return NextResponse.json(
        { message: 'Este usuario ya tiene Plan Pro. Puedes contactarle directamente.' },
        { status: 400 }
      )
    }

    // Store interest notification in database
    await prisma.interestNotification.create({
      data: {
        profileId,
        interestedUserId: session.user.id,
        status: 'pending'
      }
    })

    // Send email notification using Resend
    try {
      const { sendInterestNotificationEmail } = await import('@/lib/email')
      const profileUrl = `${process.env.APP_URL || 'https://workhoops.es'}/talento/perfiles/${profileId}`
      
      await sendInterestNotificationEmail(
        profile.user.email!,
        profile.user.name || profile.fullName,
        session.user.name || 'Un usuario',
        profileUrl
      )
    } catch (emailError) {
      console.error('Error sending interest notification email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notificación de interés enviada. El usuario recibirá un email informándole.'
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

    console.error('Error notifying interest:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
