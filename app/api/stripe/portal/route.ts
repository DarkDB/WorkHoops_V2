import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      logger.warn({ userId: session.user.id }, 'Portal: user has no Stripe customer ID')
      return NextResponse.json(
        { message: 'No se encontró una suscripción activa asociada a tu cuenta' },
        { status: 400 }
      )
    }

    // Determine return URL from request body or fallback to /planes
    let returnUrl = `${process.env.APP_URL ?? ''}/planes`
    try {
      const body = await request.json().catch(() => ({}))
      if (body?.returnUrl && typeof body.returnUrl === 'string') {
        returnUrl = body.returnUrl
      }
    } catch {
      // ignore — returnUrl stays as default
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    })

    logger.info({ userId: session.user.id, portalSessionId: portalSession.id }, 'Stripe customer portal session created')

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    logger.error({ error }, 'Error creating Stripe customer portal session')
    return NextResponse.json(
      { message: 'Error al abrir el portal de gestión de suscripción' },
      { status: 500 }
    )
  }
}
