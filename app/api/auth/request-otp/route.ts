import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const requestOtpSchema = z.object({
  email: z.string().email('Email inválido').max(255),
})

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    // ========== RATE LIMITING ==========
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000)

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: 'Demasiados intentos. Espera un minuto.' },
        { status: 429 }
      )
    }

    // ========== VALIDATION ==========
    const body = await request.json()
    const validation = requestOtpSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    const email = validation.data.email.toLowerCase().trim()

    // ========== ALWAYS RETURN GENERIC RESPONSE (anti-enumeration) ==========
    const genericResponse = () => NextResponse.json({
      message: 'Si el email está registrado, recibirás un código de acceso.',
      success: true
    })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        mustResetPassword: true,
        isActive: true,
      }
    })

    // If no user, return generic (don't reveal user existence)
    if (!user || !user.isActive) {
      // Simulate delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return genericResponse()
    }

    // Only allow OTP for users without password OR in reset mode
    if (user.passwordHash && !user.mustResetPassword) {
      // User has password and doesn't need reset - they should use normal login
      // But return generic to not reveal this
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return genericResponse()
    }

    // ========== GENERATE OTP ==========
    const otpCode = generateOtp()
    const otpHash = await hash(otpCode, 12)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Mark user as needing reset if they don't have password
    if (!user.passwordHash && !user.mustResetPassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mustResetPassword: true }
      })
    }

    // Invalidate previous unused OTPs
    await prisma.otpToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      }
    })

    // Create new OTP token
    await prisma.otpToken.create({
      data: {
        userId: user.id,
        tokenHash: otpHash,
        expiresAt,
      }
    })

    // ========== SEND OTP EMAIL ==========
    try {
      const { sendOtpEmail } = await import('@/lib/email')
      await sendOtpEmail(user.email, user.name || 'Usuario', otpCode)
      console.log('[OTP] Sent OTP to:', email)
    } catch (emailError) {
      console.error('[OTP] Failed to send email:', emailError)
      // Still return success to not reveal email delivery status
    }

    return genericResponse()

  } catch (error) {
    console.error('[REQUEST-OTP] Error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
