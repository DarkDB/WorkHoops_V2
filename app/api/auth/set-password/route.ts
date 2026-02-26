import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const setPasswordSchema = z.object({
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    // ========== REQUIRE SESSION ==========
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    // ========== CHECK MUST RESET PASSWORD ==========
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        mustResetPassword: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (!user.mustResetPassword) {
      return NextResponse.json(
        { message: 'No se requiere cambio de contraseña' },
        { status: 400 }
      )
    }

    // ========== VALIDATION ==========
    const body = await request.json()
    const validation = setPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { password } = validation.data

    // ========== HASH AND UPDATE PASSWORD ==========
    const passwordHash = await hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        mustResetPassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    })

    // ========== INVALIDATE ALL OTP TOKENS ==========
    await prisma.otpToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      }
    })

    console.log('[SET-PASSWORD] Password set for user:', session.user.email)

    return NextResponse.json({
      message: 'Contraseña establecida correctamente',
      success: true
    })

  } catch (error) {
    console.error('[SET-PASSWORD] Error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
