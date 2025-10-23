





import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createSubscriptionCheckout, createOneTimeCheckout } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  planType: z.enum(['pro_semipro', 'destacado']),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  returnUrl: z.string().url().optional(),
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
    const validatedData = checkoutSchema.parse(body)
    const { planType, billingCycle, returnUrl } = validatedData

    // Get the origin from the request or use provided returnUrl
    const origin = returnUrl || request.headers.get('origin') || process.env.APP_URL
    
    // Build success and cancel URLs
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/planes`

    let checkoutSession

    // Create appropriate checkout session based on plan type
    if (planType === 'pro_semipro') {
      checkoutSession = await createSubscriptionCheckout(
        session.user.id,
        session.user.email,
        planType,
        successUrl,
        cancelUrl,
        billingCycle || 'monthly'
      )
    } else if (planType === 'destacado') {
      checkoutSession = await createOneTimeCheckout(
        session.user.id,
        session.user.email,
        planType,
        successUrl,
        cancelUrl
      )
    } else {
      return NextResponse.json(
        { message: 'Plan no válido' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { message: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}
