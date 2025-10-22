import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

// Stripe Price IDs - Need to be created in Stripe Dashboard
// After creating products in Stripe, update these IDs
export const STRIPE_PRICE_IDS = {
  pro_semipro_monthly: process.env.STRIPE_PRICE_PRO_SEMIPRO || '', // €4.99/month recurring
  pro_semipro_annual: process.env.STRIPE_PRICE_PRO_SEMIPRO_ANNUAL || '', // €39/year recurring
  destacado_once: process.env.STRIPE_PRICE_DESTACADO || '', // €49.90 one-time for 60 days
}

// Plan configuration
export const PLANS = {
  free_amateur: {
    name: 'Free Amateur',
    stripePriceId: null,
    price: 0,
    currency: 'EUR',
    interval: null,
    features: [
      'Publicación básica',
      'Visibilidad 30 días',
      'Soporte por email'
    ]
  },
  pro_semipro: {
    name: 'Pro Semipro',
    stripePriceId: STRIPE_PRICE_IDS.pro_semipro_monthly,
    price: 4.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Publicaciones ilimitadas',
      'Visibilidad 60 días',
      'Estadísticas avanzadas',
      'Soporte prioritario'
    ]
  },
  club_agencia: {
    name: 'Club/Agencia',
    stripePriceId: null, // Free plan
    price: 0,
    currency: 'EUR',
    interval: null,
    features: [
      'Publicaciones ilimitadas',
      'Gestión de equipo',
      'Soporte dedicado'
    ]
  },
  destacado: {
    name: 'Destacado',
    stripePriceId: STRIPE_PRICE_IDS.destacado_once,
    price: 49.90,
    currency: 'EUR',
    interval: '60_days',
    features: [
      'Publicación destacada',
      'Visibilidad prioritaria',
      'Válido por 60 días',
      'Promoción en redes sociales'
    ]
  }
}

export type PlanType = keyof typeof PLANS

/**
 * Create a Stripe checkout session for subscription (Pro Semipro)
 */
export async function createSubscriptionCheckout(
  userId: string,
  userEmail: string,
  planType: 'pro_semipro',
  successUrl: string,
  cancelUrl: string,
  billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<Stripe.Checkout.Session> {
  const plan = PLANS[planType]
  
  if (!plan.stripePriceId) {
    throw new Error('This plan does not require payment')
  }

  // Select the correct price ID based on billing cycle
  const priceId = billingCycle === 'annual' 
    ? STRIPE_PRICE_IDS.pro_semipro_annual 
    : STRIPE_PRICE_IDS.pro_semipro_monthly

  if (!priceId) {
    throw new Error(`Price ID not configured for ${billingCycle} billing`)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      planType,
      billingCycle,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
        planType,
        billingCycle,
      },
    },
  })

  return session
}

/**
 * Create a Stripe checkout session for one-time payment (Destacado)
 */
export async function createOneTimeCheckout(
  userId: string,
  userEmail: string,
  planType: 'destacado',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const plan = PLANS[planType]
  
  if (!plan.stripePriceId) {
    throw new Error('This plan does not require payment')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      planType,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

/**
 * Handle successful subscription payment
 */
export async function handleSubscriptionSuccess(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id
  const planType = session.metadata?.planType

  if (!userId || !planType) {
    throw new Error('Missing user ID or plan type in session metadata')
  }

  const { prisma } = await import('@/lib/prisma')

  // Update user's plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType,
      planStart: new Date(),
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    }
  })
}

/**
 * Handle successful one-time payment
 */
export async function handleOneTimePaymentSuccess(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.client_reference_id
  const planType = session.metadata?.planType

  if (!userId || !planType) {
    throw new Error('Missing user ID or plan type in session metadata')
  }

  const { prisma } = await import('@/lib/prisma')

  // Calculate plan end date (60 days from now)
  const planEnd = new Date()
  planEnd.setDate(planEnd.getDate() + 60)

  // Update user's plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType,
      planStart: new Date(),
      planEnd,
      stripeCustomerId: session.customer as string,
    }
  })
}

/**
 * Construct webhook event from Stripe signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}