import Stripe from 'stripe'

// For development, use a placeholder key if not provided
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

// Stripe Products and Prices (configure these in Stripe Dashboard)
export const STRIPE_PLANS = {
  free: {
    name: 'Plan Gratuito',
    priceId: null, // No payment required
    price: 0,
    features: [
      'Publicación básica',
      'Visibilidad 30 días',
      'Soporte por email'
    ],
    maxPublications: 1
  },
  featured: {
    name: 'Plan Destacado',
    priceId: process.env.STRIPE_FEATURED_PRICE_ID || 'price_featured_placeholder',
    price: 29,
    features: [
      'Publicación destacada',
      'Visibilidad 60 días', 
      'Promoción en redes sociales',
      'Soporte prioritario'
    ],
    maxPublications: 5
  }
}

export async function createCheckoutSession(
  planId: keyof typeof STRIPE_PLANS,
  opportunityId: string,
  organizationEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const plan = STRIPE_PLANS[planId]
  
  if (!plan || !plan.priceId) {
    throw new Error('Invalid plan or plan does not require payment')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: organizationEmail,
    client_reference_id: opportunityId,
    metadata: {
      opportunityId,
      planId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: {
      enabled: true,
    },
    billing_address_collection: 'required',
  })

  return session
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

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

export async function handleSuccessfulPayment(
  session: Stripe.Checkout.Session
): Promise<void> {
  const opportunityId = session.client_reference_id
  const planId = session.metadata?.planId as keyof typeof STRIPE_PLANS

  if (!opportunityId || !planId) {
    throw new Error('Missing opportunity ID or plan ID in session metadata')
  }

  // Import prisma here to avoid circular dependencies
  const { prisma } = await import('@/lib/prisma')
  const { sendPaymentConfirmationEmail } = await import('@/lib/email')

  // Update opportunity status to published and set featured if applicable
  const updateData: any = {
    status: 'publicada',
    publishedAt: new Date(),
  }

  if (planId === 'featured') {
    updateData.featured = true
  }

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: updateData,
    include: {
      organization: {
        include: {
          owner: true
        }
      }
    }
  })

  // Create audit log
  // TODO: Implement audit log when model is ready
  /*
  await prisma.auditLog.create({
    data: {
      actorId: opportunity.authorId,
      action: 'payment_completed',
      entity: 'opportunity',
      entityId: opportunity.id,
      metadata: JSON.stringify({
        planId,
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
      })
    }
  })
  */

  // Send confirmation email
  if (opportunity.organization.owner.email) {
    await sendPaymentConfirmationEmail(
      opportunity.organization.owner.email,
      opportunity.organization.name,
      opportunity.title,
      STRIPE_PLANS[planId].name
    )
  }
}

export function validateWebhookSignature(payload: string, signature: string): boolean {
  try {
    constructWebhookEvent(payload, signature)
    return true
  } catch (error) {
    console.error('Webhook signature validation failed:', error)
    return false
  }
}