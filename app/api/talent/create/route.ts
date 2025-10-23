





import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const talentProfileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  birthDate: z.string(),
  role: z.string(),
  city: z.string().min(2, 'La ciudad es requerida'),
  position: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bio: z.string().max(500).optional(),
  video: z.string().url().optional().or(z.literal('')),
  social: z.string().url().optional().or(z.literal(''))
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión para crear un perfil.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = talentProfileSchema.parse(body)

    // Check if user already has a talent profile
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          fullName: validatedData.fullName,
          birthDate: new Date(validatedData.birthDate),
          role: validatedData.role,
          city: validatedData.city,
          position: validatedData.position || null,
          height: validatedData.height ? parseInt(validatedData.height) : null,
          weight: validatedData.weight ? parseInt(validatedData.weight) : null,
          bio: validatedData.bio || null,
          videoUrl: validatedData.video || null,
          socialUrl: validatedData.social || null,
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        profile: updatedProfile
      })
    }

    // Create new talent profile
    const talentProfile = await prisma.talentProfile.create({
      data: {
        fullName: validatedData.fullName,
        birthDate: new Date(validatedData.birthDate),
        role: validatedData.role,
        city: validatedData.city,
        position: validatedData.position || null,
        height: validatedData.height ? parseInt(validatedData.height) : null,
        weight: validatedData.weight ? parseInt(validatedData.weight) : null,
        bio: validatedData.bio || null,
        videoUrl: validatedData.video || null,
        socialUrl: validatedData.social || null,
        userId: session.user.id
      }
    })

    // Also update the user's name if different
    if (session.user.name !== validatedData.fullName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.fullName }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil de talento creado exitosamente',
      profile: talentProfile
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating talent profile:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
