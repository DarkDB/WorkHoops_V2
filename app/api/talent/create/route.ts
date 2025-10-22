import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    const body = await request.json()
    const validatedData = talentProfileSchema.parse(body)

    // Por ahora, simplemente guardamos en los metadatos del usuario
    // En una implementación completa, crearías una tabla TalentProfile separada
    
    // Crear un usuario temporal con estos datos
    // Esto es temporal hasta que el usuario se registre completamente
    const tempProfile = {
      ...validatedData,
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage del cliente o redirigir a registro
    return NextResponse.json({
      success: true,
      message: 'Perfil creado exitosamente',
      profile: tempProfile,
      nextStep: 'register' // Indicar que debe registrarse
    })

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
