import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['jugador', 'entrenador', 'club']).default('jugador'),
  planType: z.enum(['free_amateur', 'pro_semipro', 'club_agencia', 'destacado']).default('free_amateur'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    const { name, email, password, role, planType } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Hash password (not storing for now in development)
    // const hashedPassword = await hash(password, 12)

    // Auto-assign admin role if email matches
    const finalRole = email === 'admin@workhoops.com' ? 'admin' : role
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: finalRole,
        planType,
      }
    })

    // Remove sensitive data
    const { ...safeUser } = user

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: safeUser
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}