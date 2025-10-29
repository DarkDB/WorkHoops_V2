import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const city = searchParams.get('city')
    const position = searchParams.get('position')

    // Build filter
    const where: any = {
      isPublic: true,
      // Only show profiles with at least 50% completion
      profileCompletionPercentage: {
        gte: 50
      }
    }

    if (role) {
      where.role = role
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }

    if (position) {
      where.position = {
        contains: position,
        mode: 'insensitive'
      }
    }

    // Fetch public talent profiles
    const profiles = await prisma.talentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            image: true,
            planType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      profiles,
      total: profiles.length
    })

  } catch (error) {
    console.error('Error fetching talent profiles:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
