import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type SiteStats = {
  opportunities: number
  organizations: number
  users: number
  profiles: number
}

export async function getSiteStats(): Promise<SiteStats | null> {
  try {
    const [opportunities, organizations, users, profiles] = await Promise.all([
      prisma.opportunity.count({
        where: { status: 'publicada' },
      }),
      prisma.user.count({
        where: {
          role: {
            in: ['club', 'agencia']
          },
          verified: true,
          clubAgencyProfile: {
            is: {
              isPublic: true,
              slug: {
                not: null
              }
            }
          }
        },
      }),
      prisma.user.count(),
      prisma.talentProfile.count({
        where: { profileCompletionPercentage: { gte: 50 } }
      }),
    ])

    return {
      opportunities,
      organizations,
      users,
      profiles,
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Site stats are unavailable because the database connection could not be established')
      return null
    }

    throw error
  }
}
