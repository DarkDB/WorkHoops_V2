import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendClubWeeklyRecruitingSummaryEmail } from '@/lib/email'
import { logEmailEvent, shouldSendEmail } from '@/lib/email-lifecycle'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return true
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  const vercelCron = request.headers.get('x-vercel-cron')
  if (vercelCron === '1') {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const clubs = await prisma.user.findMany({
      where: {
        role: {
          in: ['club', 'agencia']
        },
        isActive: true
      },
      include: {
        clubAgencyProfile: {
          select: {
            legalName: true,
            commercialName: true,
            contactEmail: true
          }
        }
      }
    })

    let sent = 0
    const weekKey = new Date().toISOString().slice(0, 10)

    for (const club of clubs) {
      const [newLeads, pendingInvitations, pendingShortlist] = await Promise.all([
        prisma.clubLead.count({
          where: {
            clubUserId: club.id,
            status: 'NEW'
          }
        }),
        prisma.talentInvitation.count({
          where: {
            clubUserId: club.id,
            status: {
              in: ['SENT', 'VIEWED']
            }
          }
        }),
        prisma.talentShortlist.count({
          where: {
            clubUserId: club.id,
            status: {
              in: ['SAVED', 'CONTACTED']
            }
          }
        })
      ])

      if (newLeads + pendingInvitations + pendingShortlist === 0) {
        continue
      }

      const clubName = club.clubAgencyProfile?.commercialName || club.clubAgencyProfile?.legalName || club.name || 'Club'
      const clubEmail = club.clubAgencyProfile?.contactEmail || club.email

      if (!clubEmail) {
        continue
      }

      const dedupeKey = `club-weekly-summary:${club.id}:${weekKey}`
      const canSend = await shouldSendEmail({
        userId: club.id,
        email: clubEmail,
        category: 'club_digest',
        template: 'club_weekly_recruiting_summary',
        dedupeKey,
        minIntervalHours: 24 * 6
      })

      if (!canSend) {
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_digest',
          template: 'club_weekly_recruiting_summary',
          dedupeKey,
          status: 'skipped'
        })
        continue
      }

      try {
        await sendClubWeeklyRecruitingSummaryEmail({
          clubEmail,
          clubName,
          newLeads,
          pendingInvitations,
          pendingShortlist,
          dashboardUrl: `${process.env.APP_URL || 'https://workhoops.es'}/dashboard`
        })
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_digest',
          template: 'club_weekly_recruiting_summary',
          dedupeKey,
          status: 'sent'
        })
        sent += 1
      } catch (error) {
        console.error(`Failed summary email for club ${club.id}:`, error)
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_digest',
          template: 'club_weekly_recruiting_summary',
          dedupeKey,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: clubs.length,
      sent
    })
  } catch (error) {
    console.error('Error in weekly club summary cron:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
