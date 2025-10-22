import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
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

    const body = await request.json()
    const { profileId, profileUserId } = contactSchema.parse(body)

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

    // TODO: Implement email notification or in-app notification
    // For now, just return success
    // You could create a Notification table and store the contact request

    return NextResponse.json({
      success: true,
      message: 'Solicitud de contacto enviada. El usuario será notificado.'
    })

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
