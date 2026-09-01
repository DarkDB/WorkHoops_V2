





import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import {
  createSubscriptionCheckout,
  createOneTimeCheckout,
  getStripe,
  hasBlockingSubscriptionStatus,
} from '@/lib/stripe'
import { z } from 'zod'
import logger from '@/lib/logger'

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

    // Stripe confirms whether the locally stored subscription is still billable.
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        planType: true,
        stripeSubscriptionId: true,
      },
    })

    if (planType === 'pro_semipro' && user?.planType === planType && user.stripeSubscriptionId) {
      const stripeSubscription = await getStripe().subscriptions.retrieve(user.stripeSubscriptionId)

      if (hasBlockingSubscriptionStatus(stripeSubscription.status)) {
        return NextResponse.json(
          {
            message: 'Ya tienes una suscripción activa a este plan',
            error: 'ALREADY_SUBSCRIBED',
          },
          { status: 400 }
        )
      }
    }

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

    logger.error({ error }, 'Error creating Stripe checkout session')
    return NextResponse.json(
      { message: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}
