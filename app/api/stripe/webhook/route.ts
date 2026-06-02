import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, handleSubscriptionSuccess, handleOneTimePaymentSuccess } from '@/lib/stripe'
import Stripe from 'stripe'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.error('Stripe webhook: missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      logger.error({ err }, 'Stripe webhook: signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    logger.info({ eventType: event.type, eventId: event.id }, 'Stripe webhook event received')

    switch (event.type) {
      // ── Checkout completado ──────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          try {
            if (session.mode === 'subscription') {
              await handleSubscriptionSuccess(session)

              // Upsert Subscription record
              const { prisma } = await import('@/lib/prisma')
              const stripeSubscriptionId = session.subscription as string

              if (stripeSubscriptionId) {
                const stripeSub = await import('@/lib/stripe').then(m =>
                  m.stripe.subscriptions.retrieve(stripeSubscriptionId)
                )

                await prisma.subscription.upsert({
                  where: { stripeSubscriptionId },
                  create: {
                    userId: session.client_reference_id!,
                    stripeSubscriptionId,
                    stripePriceId: stripeSub.items.data[0]?.price.id ?? '',
                    stripeCustomerId: session.customer as string,
                    status: stripeSub.status,
                    planType: session.metadata?.planType ?? 'pro_semipro',
                    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                  },
                  update: {
                    status: stripeSub.status,
                    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                  },
                })
              }

              logger.info({ sessionId: session.id }, 'Subscription checkout completed successfully')
            } else if (session.mode === 'payment') {
              await handleOneTimePaymentSuccess(session)
              logger.info({ sessionId: session.id }, 'One-time payment checkout completed successfully')
            }
          } catch (error) {
            logger.error({ error, sessionId: session.id }, 'Error handling checkout.session.completed')
            // Return 500 so Stripe retries the webhook
            return NextResponse.json(
              { error: 'Failed to process payment' },
              { status: 500 }
            )
          }
        }
        break
      }

      // ── Suscripción cancelada / eliminada ────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        try {
          const { prisma } = await import('@/lib/prisma')

          // Downgrade user to free plan
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          })

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planType: 'free_amateur',
                stripeSubscriptionId: null,
                planEnd: new Date(),
              },
            })
            logger.info({ userId: user.id, subscriptionId: subscription.id }, 'Subscription deleted — user downgraded to free_amateur')
          } else {
            logger.warn({ subscriptionId: subscription.id }, 'customer.subscription.deleted: no user found for subscription')
          }

          // Mark subscription record as canceled
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: 'canceled' },
          })
        } catch (error) {
          logger.error({ error, subscriptionId: subscription.id }, 'Error handling customer.subscription.deleted')
          return NextResponse.json(
            { error: 'Failed to process subscription deletion' },
            { status: 500 }
          )
        }
        break
      }

      // ── Pago de factura fallido ──────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        try {
          const { prisma } = await import('@/lib/prisma')
          const stripeSubscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id

          if (stripeSubscriptionId) {
            // Mark subscription as past_due
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId },
              data: { status: 'past_due' },
            })

            // Find user and mark their subscription as past_due
            const user = await prisma.user.findFirst({
              where: { stripeSubscriptionId },
            })

            if (user) {
              logger.warn(
                { userId: user.id, subscriptionId: stripeSubscriptionId, invoiceId: invoice.id },
                'invoice.payment_failed — subscription marked as past_due'
              )
            } else {
              logger.warn({ stripeSubscriptionId, invoiceId: invoice.id }, 'invoice.payment_failed: no user found for subscription')
            }
          }
        } catch (error) {
          logger.error({ error, invoiceId: invoice.id }, 'Error handling invoice.payment_failed')
          return NextResponse.json(
            { error: 'Failed to process payment failure' },
            { status: 500 }
          )
        }
        break
      }

      // ── Suscripción actualizada (renovaciones, cambios de plan) ──────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        try {
          const { prisma } = await import('@/lib/prisma')

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          })

          logger.info({ subscriptionId: subscription.id, status: subscription.status }, 'Subscription updated')
        } catch (error) {
          logger.error({ error, subscriptionId: subscription.id }, 'Error handling customer.subscription.updated')
        }
        break
      }

      default:
        logger.debug({ eventType: event.type }, 'Unhandled Stripe webhook event')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error({ error }, 'Stripe webhook: unhandled error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
