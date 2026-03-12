import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')?.trim() || undefined
    const entityType = searchParams.get('entityType')?.trim()

    const clubs = await prisma.user.findMany({
      where: {
        role: {
          in: ['club', 'agencia']
        },
        clubAgencyProfile: {
          is: {
            profileCompletionPercentage: {
              gte: 60
            },
            ...(city
              ? {
                  city: {
                    contains: city,
                    mode: 'insensitive'
                  }
                }
              : {}),
            ...(entityType && entityType !== 'all'
              ? {
                  entityType
                }
              : {})
          }
        },
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

    const clubsWithCount = clubs
      .filter((club) => !!club.clubAgencyProfile)
      .map(club => ({
      id: club.id,
      name: club.name,
      email: club.email,
      image: club.image,
      role: club.role,
      planType: club.planType,
      verified: club.verified,
      profile: club.clubAgencyProfile!,
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
