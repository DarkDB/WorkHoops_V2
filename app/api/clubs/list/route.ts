import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const entityType = searchParams.get('entityType')

    // Fetch all clubs/agencies with their profiles
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
          },
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [
        {
          planType: 'desc' // Destacados primero
        }
      ]
    })

    // Filter clubs in JavaScript to ensure correct logic
    let filteredClubs = allClubs.filter(club => {
      // Must have a profile
      if (!club.clubAgencyProfile) return false
      
      // Must have at least 60% completion
      if (!club.clubAgencyProfile.profileCompletionPercentage || 
          club.clubAgencyProfile.profileCompletionPercentage < 60) return false
      
      // Apply city filter if provided
      if (city && !club.clubAgencyProfile.city?.toLowerCase().includes(city.toLowerCase())) {
        return false
      }
      
      // Apply entity type filter if provided
      if (entityType && entityType !== 'all' && club.clubAgencyProfile.entityType !== entityType) {
        return false
      }
      
      return true
    })

    // Transform and sort by number of active opportunities
    const clubsWithCount = filteredClubs.map(club => ({
      id: club.id,
      name: club.name,
      email: club.email,
      image: club.image,
      role: club.role,
      planType: club.planType,
      verified: club.verified,
      profile: club.clubAgencyProfile,
      opportunitiesCount: club.opportunities.length
    }))

    // Sort by opportunities count (most first), keeping destacado priority
    clubsWithCount.sort((a, b) => {
      // First by plan type (destacado first)
      if (a.planType === 'destacado' && b.planType !== 'destacado') return -1
      if (a.planType !== 'destacado' && b.planType === 'destacado') return 1
      
      // Then by opportunities count
      return b.opportunitiesCount - a.opportunitiesCount
    })

    return NextResponse.json({
      clubs: clubsWithCount,
      total: clubsWithCount.length
    })

  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
