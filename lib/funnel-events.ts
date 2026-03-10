import { prisma } from '@/lib/prisma'

type FunnelEventName =
  | 'profile_created'
  | 'availability_enabled'
  | 'talent_shortlisted'
  | 'talent_contacted'
  | 'invitation_sent'
  | 'application_sent'

interface TrackFunnelEventParams {
  eventName: FunnelEventName
  userId?: string | null
  role?: string | null
  metadata?: Record<string, unknown>
}

export async function trackFunnelEvent({
  eventName,
  userId,
  role,
  metadata
}: TrackFunnelEventParams) {
  try {
    await (prisma as any).funnelEvent.create({
      data: {
        eventName,
        userId: userId || null,
        role: role || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    console.error('[FUNNEL] Failed to track event:', eventName, error)
  }
}
