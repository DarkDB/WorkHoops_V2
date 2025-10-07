import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, STRIPE_PLANS } from '@/lib/stripe'
import { rateLimitByIP } from '@/lib/rate-limit'
import { z } from 'zod'

const checkoutSchema = z.object({
  opportunityId: z.string().cuid(),
  planId: z.enum(['free', 'featured']),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000) // 5 requests per minute

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!['org', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { opportunityId, planId } = validation.data

    // Verify opportunity exists and user can publish it
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        organization: {
          select: {
            ownerId: true,
            name: true,
          },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Check ownership for non-admin users
    if (session.user.role === 'org' && opportunity.organization.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only publish opportunities for your own organization' },
        { status: 403 }
      )
    }

    // Check if opportunity is in draft state
    if (opportunity.status !== 'borrador') {
      return NextResponse.json(
        { error: 'Opportunity is not in draft state' },
        { status: 400 }
      )
    }

    // Handle free plan - publish immediately
    if (planId === 'free') {
      const publishedOpportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: {
          status: 'publicada',
          publishedAt: new Date(),
          featured: false,
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'published_free',
          entity: 'opportunity',
          entityId: opportunityId,
          metadata: {
            planId,
            title: opportunity.title,
          },
        },
      })

      return NextResponse.json({
        success: true,
        opportunity: publishedOpportunity,
        message: 'Opportunity published successfully',
      })
    }

    // Handle paid plans - create Stripe checkout session
    const plan = STRIPE_PLANS[planId]
    if (!plan || !plan.priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const successUrl = `${process.env.APP_URL}/dashboard/opportunities?payment=success`
    const cancelUrl = `${process.env.APP_URL}/publicar/${opportunityId}?payment=cancelled`

    const checkoutSession = await createCheckoutSession(
      planId,
      opportunityId,
      session.user.email!,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}