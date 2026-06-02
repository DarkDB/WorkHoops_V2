/**
 * POST /api/email/onboarding
 *
 * Manually trigger (or cron-trigger) an onboarding sequence email for a user.
 *
 * Body:
 *   { userId: string, emailNumber: 1 | 2 | 3 }
 *
 * Security: requires CRON_SECRET header (same pattern as other internal routes).
 * For manual testing, any authenticated admin can also call it.
 *
 * The endpoint is intentionally idempotent — the email-lifecycle layer (shouldSendEmail)
 * prevents duplicate sends via deduplication keys.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendOnboardingEmail } from '@/lib/email-sequences'
import { shouldSendEmail, logEmailEvent } from '@/lib/email-lifecycle'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  userId: z.string().min(1),
  emailNumber: z.number().int().min(1).max(3),
})

// ─── Auth guard ───────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader === `Bearer ${cronSecret}`) return true
  }

  // Allow in development without a secret configured
  if (process.env.NODE_ENV === 'development' && !process.env.CRON_SECRET) {
    return true
  }

  return false
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validation error', errors: parsed.error.errors },
      { status: 400 }
    )
  }

  const { userId, emailNumber } = parsed.data

  // ── Look up the user ──────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  const template = `onboarding_${emailNumber}`
  const dedupeKey = `${template}:${user.id}`

  // ── Deduplication + preference check ─────────────────────────────────────
  const canSend = await shouldSendEmail({
    userId: user.id,
    email: user.email,
    category: 'onboarding',
    template,
    dedupeKey,
    minIntervalHours: 0, // dedupeKey alone is enough — we don't want interval blocking here
  })

  if (!canSend) {
    logger.info({ userId, emailNumber }, '[ONBOARDING API] Email already sent or user opted out')
    return NextResponse.json({ message: 'Email already sent or user opted out', skipped: true })
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  try {
    await sendOnboardingEmail(emailNumber, {
      id: user.id,
      email: user.email,
      name: user.name ?? 'Usuario',
      role: user.role,
    })

    await logEmailEvent({
      userId: user.id,
      email: user.email,
      category: 'onboarding',
      template,
      dedupeKey,
      status: 'sent',
    })

    logger.info({ userId, emailNumber }, '[ONBOARDING API] Email sent successfully')
    return NextResponse.json({ message: 'Email sent', userId, emailNumber })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logger.error({ err, userId, emailNumber }, '[ONBOARDING API] Failed to send email')

    await logEmailEvent({
      userId: user.id,
      email: user.email,
      category: 'onboarding',
      template,
      dedupeKey,
      status: 'failed',
      error: errorMessage,
    })

    return NextResponse.json(
      { message: 'Failed to send email', error: errorMessage },
      { status: 500 }
    )
  }
}
