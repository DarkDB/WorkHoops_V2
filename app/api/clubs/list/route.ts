import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const entityType = searchParams.get('entityType')

    // Build filter for clubs/agencies
    const where: any = {
      role: {
        in: ['club', 'agencia']
      },
      clubAgencyProfile: {
        isNot: null,
        profileCompletionPercentage: {
          gte: 60 // Solo mostrar perfiles con al menos 60% completitud
        }
      }
    }

    if (city) {
      where.clubAgencyProfile.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (entityType) {
      where.clubAgencyProfile.entityType = entityType
    }

    // Fetch clubs with their profiles and opportunities count
    const clubs = await prisma.user.findMany({
      where,
      include: {
        clubAgencyProfile: true,
        opportunities: {
          where: {
            status: 'publicada' // Solo contar ofertas publicadas
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

    // Transform and sort by number of active opportunities
    const clubsWithCount = clubs.map(club => ({
      id: club.id,
      name: club.name,
      email: club.email,
      image: club.image,
      role: club.role,
      planType: club.planType,
      verified: club.verified,
      profile: club.clubAgencyProfile,
      opportunitiesCount: club.opportunities.length,
      hasFeaturedOpportunities: club.opportunities.some(o => o.featured)
    }))

    // Sort by opportunities count (most first), then by plan type
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
