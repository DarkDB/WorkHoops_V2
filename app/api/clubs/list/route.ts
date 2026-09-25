import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toPublicClubListItem } from '@/lib/agency-pilot-safety'

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
            isPublic: true,
            slug: {
              not: null
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
      select: {
        id: true,
        verified: true,
        planType: true,
        clubAgencyProfile: {
          select: {
            slug: true,
            legalName: true,
            commercialName: true,
            city: true,
            logo: true
          }
        },
        opportunities: {
          where: {
            status: 'publicada'
          },
          select: {
            id: true
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
      .map((club) => ({ item: toPublicClubListItem(club), planType: club.planType }))
      .filter((club): club is { item: NonNullable<typeof club.item>; planType: string } => !!club.item)

    // Sort by opportunities count (most first), keeping destacado priority
    clubsWithCount.sort((a, b) => {
      // First by plan type (destacado first)
      if (a.planType === 'destacado' && b.planType !== 'destacado') return -1
      if (a.planType !== 'destacado' && b.planType === 'destacado') return 1
      
      // Then by opportunities count
      return b.item.opportunitiesCount - a.item.opportunitiesCount
    })

    return NextResponse.json({
      clubs: clubsWithCount.map(({ item }) => item),
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
