import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, handleSubscriptionSuccess, handleOneTimePaymentSuccess } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          try {
            // Check if it's a subscription or one-time payment
            if (session.mode === 'subscription') {
              await handleSubscriptionSuccess(session)
              console.log('Successfully handled subscription for session:', session.id)
            } else if (session.mode === 'payment') {
              await handleOneTimePaymentSuccess(session)
              console.log('Successfully handled one-time payment for session:', session.id)
            }
          } catch (error) {
            console.error('Error handling successful payment:', error)
            // Return error so Stripe retries the webhook
            return NextResponse.json(
              { error: 'Failed to process payment' },
              { status: 500 }
            )
          }
        }
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        
        try {
          // Handle subscription cancellation
          const { prisma } = await import('@/lib/prisma')
          
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id }
          })

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planType: 'free_amateur',
                stripeSubscriptionId: null,
              }
            })
            console.log('Subscription cancelled for user:', user.id)
          }
        } catch (error) {
          console.error('Error handling subscription cancellation:', error)
        }
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent failed:', failedPayment.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
