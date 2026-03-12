import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').max(255),
})

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000)

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: 'Demasiados intentos. Espera un minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    const email = validation.data.email.toLowerCase().trim()
    const genericResponse = () =>
      NextResponse.json({
        message: 'Si el email está registrado, recibirás instrucciones para recuperar acceso.',
        success: true
      })

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))
      return genericResponse()
    }

    const otpCode = generateOtp()
    const otpHash = await hash(otpCode, 12)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { mustResetPassword: true }
    })

    await prisma.otpToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      }
    })

    await prisma.otpToken.create({
      data: {
        userId: user.id,
        tokenHash: otpHash,
        expiresAt,
      }
    })

    try {
      const { sendOtpEmail } = await import('@/lib/email')
      await sendOtpEmail(user.email, user.name || 'Usuario', otpCode)
      console.log('[FORGOT-PASSWORD] OTP sent to:', email)
    } catch (emailError) {
      console.error('[FORGOT-PASSWORD] Failed to send email:', emailError)
    }

    return genericResponse()
  } catch (error) {
    console.error('[FORGOT-PASSWORD] Error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
