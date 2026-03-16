import { prisma } from '@/lib/prisma'

export async function getSiteStats() {
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
}
