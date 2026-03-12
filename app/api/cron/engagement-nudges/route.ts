import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logEmailEvent, shouldSendEmail } from '@/lib/email-lifecycle'
import { sendClubRecruitingNudgeEmail, sendTalentInvitationReminderEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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
    const dayKey = now.toISOString().slice(0, 10)
    const leadsThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const shortlistThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000)
    const invitationThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    let clubSent = 0
    let talentSent = 0

    const clubs = await prisma.user.findMany({
      where: {
        role: { in: ['club', 'agencia'] },
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

    for (const club of clubs) {
      const [staleLeads, staleShortlist] = await Promise.all([
        prisma.clubLead.count({
          where: {
            clubUserId: club.id,
            status: 'NEW',
            createdAt: { lte: leadsThreshold }
          }
        }),
        prisma.talentShortlist.count({
          where: {
            clubUserId: club.id,
            status: { in: ['SAVED', 'CONTACTED'] },
            updatedAt: { lte: shortlistThreshold }
          }
        })
      ])

      if (staleLeads + staleShortlist === 0) continue

      const clubEmail = club.clubAgencyProfile?.contactEmail || club.email
      if (!clubEmail) continue

      const clubName = club.clubAgencyProfile?.commercialName || club.clubAgencyProfile?.legalName || club.name || 'Club'
      const dedupeKey = `club-nudge:${club.id}:${dayKey}`

      const canSend = await shouldSendEmail({
        userId: club.id,
        email: clubEmail,
        category: 'club_nudges',
        template: 'club_recruiting_nudge',
        dedupeKey,
        minIntervalHours: 24
      })

      if (!canSend) {
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_nudges',
          template: 'club_recruiting_nudge',
          dedupeKey,
          status: 'skipped'
        })
        continue
      }

      try {
        await sendClubRecruitingNudgeEmail({
          clubEmail,
          clubName,
          staleLeads,
          staleShortlist,
          dashboardUrl: `${process.env.APP_URL || 'https://workhoops.es'}/dashboard`
        })
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_nudges',
          template: 'club_recruiting_nudge',
          dedupeKey,
          status: 'sent'
        })
        clubSent += 1
      } catch (error) {
        await logEmailEvent({
          userId: club.id,
          email: clubEmail,
          category: 'club_nudges',
          template: 'club_recruiting_nudge',
          dedupeKey,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const talents = await prisma.talentProfile.findMany({
      where: {
        role: 'jugador',
        user: { isActive: true }
      },
      select: {
        id: true,
        fullName: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    for (const talent of talents) {
      const pendingInvitations = await prisma.talentInvitation.count({
        where: {
          talentProfileId: talent.id,
          status: { in: ['SENT', 'VIEWED'] },
          createdAt: { lte: invitationThreshold }
        }
      })

      if (pendingInvitations === 0) continue

      const talentEmail = talent.user.email || ''
      if (!talentEmail) continue

      const dedupeKey = `talent-nudge:${talent.userId}:${dayKey}`
      const canSend = await shouldSendEmail({
        userId: talent.userId,
        email: talentEmail,
        category: 'talent_nudges',
        template: 'talent_invitation_reminder',
        dedupeKey,
        minIntervalHours: 24
      })

      if (!canSend) {
        await logEmailEvent({
          userId: talent.userId,
          email: talentEmail,
          category: 'talent_nudges',
          template: 'talent_invitation_reminder',
          dedupeKey,
          status: 'skipped'
        })
        continue
      }

      try {
        await sendTalentInvitationReminderEmail({
          talentEmail,
          talentName: talent.user.name || talent.fullName,
          pendingInvitations,
          dashboardUrl: `${process.env.APP_URL || 'https://workhoops.es'}/dashboard`
        })
        await logEmailEvent({
          userId: talent.userId,
          email: talentEmail,
          category: 'talent_nudges',
          template: 'talent_invitation_reminder',
          dedupeKey,
          status: 'sent'
        })
        talentSent += 1
      } catch (error) {
        await logEmailEvent({
          userId: talent.userId,
          email: talentEmail,
          category: 'talent_nudges',
          template: 'talent_invitation_reminder',
          dedupeKey,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ success: true, clubSent, talentSent })
  } catch (error) {
    console.error('Error in engagement nudges cron:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
