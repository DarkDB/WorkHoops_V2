import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimitByUser, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

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

    // Fetch the profile to verify user has pro plan
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

    // Check if user has pro plan
    if (profile.user.planType !== 'pro_semipro' && profile.user.planType !== 'destacado') {
      return NextResponse.json(
        { message: 'Este usuario necesita actualizar su plan a Pro Semipro para recibir contactos' },
        { status: 403 }
      )
    }

    // Send email notification using Resend
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
      // Don't fail the request if email fails, just log it
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
