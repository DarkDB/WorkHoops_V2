import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  role: z.enum(['jugador', 'entrenador', 'club']).default('jugador'),
})

export async function POST(request: NextRequest) {
  try {
    // ========== RATE LIMITING ==========
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000)

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: 'Demasiados intentos. Espera un minuto.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.getTime().toString(),
          }
        }
      )
    }

    // ========== VALIDATION ==========
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // ========== CHECK EXISTING USER ==========
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true }
    })

    if (existingUser) {
      // Generic message to prevent user enumeration
      return NextResponse.json(
        { message: 'No se pudo completar el registro. Verifica tus datos.' },
        { status: 400 }
      )
    }

    // ========== HASH PASSWORD ==========
    const passwordHash = await hash(password, 12)

    // ========== CREATE USER ==========
    // NO admin backdoor - admins are created manually in DB
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        passwordUpdatedAt: new Date(),
        mustResetPassword: false,
        failedLoginAttempts: 0,
        role,
        planType: 'free_amateur',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // DO NOT include passwordHash
      }
    })

    // ========== SEND WELCOME EMAIL (non-blocking) ==========
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(name, normalizedEmail, role)
    } catch (emailError) {
      console.error('[REGISTER] Email send failed (non-critical):', emailError)
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('[REGISTER] Error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
