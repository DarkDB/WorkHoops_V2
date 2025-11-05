import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get all users with club or agency role
    const allClubs = await prisma.user.findMany({
      where: {
        role: {
          in: ['club', 'agencia']
        }
      },
      include: {
        clubAgencyProfile: true,
        opportunities: {
          where: {
            status: 'publicada'
          }
        }
      }
    })

    const clubsInfo = allClubs.map(club => ({
      id: club.id,
      name: club.name,
      email: club.email,
      role: club.role,
      planType: club.planType,
      hasProfile: !!club.clubAgencyProfile,
      profileCompletion: club.clubAgencyProfile?.profileCompletionPercentage || 0,
      city: club.clubAgencyProfile?.city || 'N/A',
      entityType: club.clubAgencyProfile?.entityType || 'N/A',
      opportunitiesCount: club.opportunities.length,
      meetsFilter: club.clubAgencyProfile && club.clubAgencyProfile.profileCompletionPercentage >= 60
    }))

    return NextResponse.json({
      total: clubsInfo.length,
      clubs: clubsInfo,
      filtered: clubsInfo.filter(c => c.meetsFilter)
    })

  } catch (error: any) {
    console.error('Error in debug:', error)
    return NextResponse.json(
      { message: 'Error', error: error.message },
      { status: 500 }
    )
  }
}
