import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const city = searchParams.get('city')
    const position = searchParams.get('position')

    let allProfiles: any[] = []

    // Fetch Player Profiles (TalentProfile with role='jugador')
    if (!role || role === 'all' || role === 'jugador') {
      const playerWhere: any = {
        isPublic: true,
        profileCompletionPercentage: { gte: 50 },
        role: 'jugador'
      }

      if (city) {
        playerWhere.city = { contains: city, mode: 'insensitive' }
      }

      if (position) {
        playerWhere.position = { contains: position, mode: 'insensitive' }
      }

      const playerProfiles = await prisma.talentProfile.findMany({
        where: playerWhere,
        include: {
          user: {
            select: {
              id: true,
              image: true,
              planType: true
            }
          }
        }
      })

      // Normalize player profiles
      allProfiles.push(...playerProfiles.map(p => ({
        id: p.id,
        fullName: p.fullName,
        role: 'jugador',
        city: p.city,
        country: p.country,
        position: p.position,
        height: p.height,
        weight: p.weight,
        bio: p.bio,
        verified: p.verified,
        createdAt: p.createdAt,
        profileCompletionPercentage: p.profileCompletionPercentage,
        user: p.user
      })))
    }

    // Fetch Coach Profiles (CoachProfile)
    if (!role || role === 'all' || role === 'entrenador') {
      const coachWhere: any = {
        profileCompletionPercentage: { gte: 50 }
      }

      if (city) {
        coachWhere.city = { contains: city, mode: 'insensitive' }
      }

      const coachProfiles = await prisma.coachProfile.findMany({
        where: coachWhere,
        include: {
          user: {
            select: {
              id: true,
              image: true,
              planType: true,
              verified: true
            }
          }
        }
      })

      // Normalize coach profiles to match the same structure
      allProfiles.push(...coachProfiles.map(c => ({
        id: c.id,
        fullName: c.fullName,
        role: 'entrenador',
        city: c.city,
        country: c.nationality || 'España',
        position: c.currentLevel || null,  // Using currentLevel as position for coaches
        height: null,
        weight: null,
        bio: c.bio,
        verified: c.user.verified,
        createdAt: c.createdAt,
        profileCompletionPercentage: c.profileCompletionPercentage,
        user: c.user
      })))
    }

    // Sort all profiles by creation date (newest first)
    allProfiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      profiles: allProfiles,
      total: allProfiles.length
    })

  } catch (error) {
    console.error('Error fetching talent profiles:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
