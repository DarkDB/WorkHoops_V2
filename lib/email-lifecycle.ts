import { prisma } from '@/lib/prisma'

type EmailStatus = 'sent' | 'skipped' | 'failed'

interface ShouldSendParams {
  userId?: string | null
  email: string
  category: string
  template: string
  dedupeKey?: string
  minIntervalHours?: number
}

interface LogEmailEventParams {
  userId?: string | null
  email: string
  category: string
  template: string
  dedupeKey?: string
  status: EmailStatus
  error?: string
}

export async function shouldSendEmail(params: ShouldSendParams) {
  const { userId, category, template, dedupeKey, minIntervalHours = 24 } = params

  if (userId) {
    const preference = await prisma.emailPreference.findUnique({
      where: {
        userId_category: {
          userId,
          category
        }
      },
      select: {
        enabled: true
      }
    })

    if (preference && !preference.enabled) {
      return false
    }
  }

  if (dedupeKey) {
    const existing = await prisma.emailEvent.findFirst({
      where: {
        dedupeKey,
        template,
        status: 'sent'
      },
      select: { id: true }
    })

    if (existing) {
      return false
    }
  }

  if (userId && minIntervalHours > 0) {
    const threshold = new Date(Date.now() - minIntervalHours * 60 * 60 * 1000)
    const recent = await prisma.emailEvent.findFirst({
      where: {
        userId,
        category,
        status: 'sent',
        createdAt: {
          gte: threshold
        }
      },
      select: { id: true }
    })

    if (recent) {
      return false
    }
  }

  return true
}

export async function logEmailEvent(params: LogEmailEventParams) {
  const { userId, email, category, template, dedupeKey, status, error } = params

  await prisma.emailEvent.create({
    data: {
      userId: userId || null,
      email,
      category,
      template,
      dedupeKey: dedupeKey || null,
      status,
      error: error || null,
      sentAt: status === 'sent' ? new Date() : null
    }
  })
}
