import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendClubNoOfferReminderEmail } from '@/lib/email'
import { logEmailEvent, shouldSendEmail } from '@/lib/email-lifecycle'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.APP_URL || 'https://workhoops.es'

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) return true

  if (request.headers.get('x-vercel-cron') === '1') return true

  return false
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    // Clubs registered between 23h and 25h ago (1h window to avoid double-sending)
    const windowStart = new Date(now.getTime() - 25 * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() - 23 * 60 * 60 * 1000)

    // Find clubs registered in the window with NO active opportunities
    const clubsWithoutOffers = await prisma.user.findMany({
      where: {
        role: { in: ['club', 'agencia'] },
        isActive: true,
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
        // No opportunities at all, or no active ones
        opportunities: {
          none: {
            status: 'publicada',
          }
        }
      },
      include: {
        clubAgencyProfile: {
          select: {
            commercialName: true,
            legalName: true,
            contactEmail: true,
          }
        }
      }
    })

    let sent = 0
    let skipped = 0
    const errors: string[] = []

    for (const club of clubsWithoutOffers) {
      const recipientEmail = (club.clubAgencyProfile?.contactEmail) || club.email
      const clubName = club.clubAgencyProfile?.commercialName || club.clubAgencyProfile?.legalName || club.name

      if (!recipientEmail) {
        skipped++
        continue
      }

      try {
        const dedupeKey = `club-no-offer-24h:${club.id}`
        const canSend = await shouldSendEmail({
          userId: club.id,
          email: recipientEmail,
          category: 'onboarding',
          template: 'club_no_offer_24h',
          dedupeKey,
          minIntervalHours: 72, // Don't resend within 3 days
        })

        if (!canSend) {
          skipped++
          await logEmailEvent({
            userId: club.id,
            email: recipientEmail,
            category: 'onboarding',
            template: 'club_no_offer_24h',
            dedupeKey,
            status: 'skipped',
          })
          continue
        }

        await sendClubNoOfferReminderEmail({
          clubEmail: recipientEmail,
          clubName,
          publishUrl: `${APP_URL}/publicar?ref=reminder`,
        })

        await logEmailEvent({
          userId: club.id,
          email: recipientEmail,
          category: 'onboarding',
          template: 'club_no_offer_24h',
          dedupeKey,
          status: 'sent',
        })

        sent++
        logger.info({ clubId: club.id, email: recipientEmail }, 'Club no-offer 24h reminder sent')
      } catch (err) {
        errors.push(`club:${club.id}`)
        logger.error({ err, clubId: club.id }, 'Failed to send club no-offer reminder')
      }
    }

    return NextResponse.json({
      ok: true,
      clubs_checked: clubsWithoutOffers.length,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    logger.error({ err: error }, '[CRON] club-no-offer-reminder failed')
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
