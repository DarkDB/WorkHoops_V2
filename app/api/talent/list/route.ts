import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const clampNumber = (value: string | null, min: number, max: number): number | null => {
  if (!value) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return Math.min(Math.max(parsed, min), max)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'all'
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const position = searchParams.get('position')
    const level = searchParams.get('level')
    const availabilityStatus = searchParams.get('availabilityStatus')
    const availableOnly = searchParams.get('availableOnly') === 'true'
    const minHeight = clampNumber(searchParams.get('minHeight'), 120, 250)
    const maxHeight = clampNumber(searchParams.get('maxHeight'), 120, 250)
    const minAge = clampNumber(searchParams.get('minAge'), 10, 60)
    const maxAge = clampNumber(searchParams.get('maxAge'), 10, 60)

    const includePlayers = role === 'all' || role === 'jugador'
    const includeCoachesBase = role === 'all' || role === 'entrenador'
    const hasPlayerSpecificFilter = !!(position || minHeight || maxHeight || minAge || maxAge || availabilityStatus || availableOnly)
    const includeCoaches = includeCoachesBase && !hasPlayerSpecificFilter

    let allProfiles: any[] = []

    if (includePlayers) {
      const playerWhere: any = {
        isPublic: true,
        profileCompletionPercentage: { gte: 50 },
        role: 'jugador'
      }

      if (search) {
        playerWhere.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (city) {
        playerWhere.city = { contains: city, mode: 'insensitive' }
      }

      if (position) {
        playerWhere.position = { contains: position, mode: 'insensitive' }
      }

      if (level) {
        playerWhere.currentLevel = { contains: level, mode: 'insensitive' }
      }

      if (availableOnly) {
        playerWhere.availabilityStatus = { in: ['AVAILABLE', 'OPEN_TO_OFFERS'] }
      } else if (availabilityStatus && ['AVAILABLE', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE'].includes(availabilityStatus)) {
        playerWhere.availabilityStatus = availabilityStatus
      }

      if (minHeight || maxHeight) {
        playerWhere.height = {
          ...(minHeight ? { gte: minHeight } : {}),
          ...(maxHeight ? { lte: maxHeight } : {})
        }
      }

      if (minAge || maxAge) {
        const today = new Date()
        const birthDateFilter: { gte?: Date; lte?: Date } = {}

        if (maxAge) {
          const minBirthDate = new Date(today)
          minBirthDate.setFullYear(today.getFullYear() - maxAge)
          birthDateFilter.gte = minBirthDate
        }

        if (minAge) {
          const maxBirthDate = new Date(today)
          maxBirthDate.setFullYear(today.getFullYear() - minAge)
          birthDateFilter.lte = maxBirthDate
        }

        playerWhere.birthDate = birthDateFilter
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
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      })

      allProfiles.push(...playerProfiles.map((p) => ({
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
        availabilityStatus: p.availabilityStatus,
        availableFrom: p.availableFrom,
        birthDate: p.birthDate,
        currentLevel: p.currentLevel,
        createdAt: p.createdAt,
        profileCompletionPercentage: p.profileCompletionPercentage,
        user: p.user
      })))
    }

    if (includeCoaches) {
      const coachWhere: any = {
        isPublic: true,
        profileCompletionPercentage: { gte: 50 }
      }

      if (search) {
        coachWhere.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (city) {
        coachWhere.city = { contains: city, mode: 'insensitive' }
      }

      if (level) {
        coachWhere.currentLevel = { contains: level, mode: 'insensitive' }
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
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      })

      allProfiles.push(...coachProfiles.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        role: 'entrenador',
        city: c.city,
        country: c.nationality || 'España',
        position: c.currentLevel || null,
        height: null,
        weight: null,
        bio: c.bio,
        verified: c.user.verified,
        availabilityStatus: null,
        availableFrom: null,
        birthDate: c.birthYear ? new Date(`${c.birthYear}-01-01`) : null,
        currentLevel: c.currentLevel,
        createdAt: c.createdAt,
        profileCompletionPercentage: c.profileCompletionPercentage,
        user: c.user
      })))
    }

    allProfiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      profiles: allProfiles,
      total: allProfiles.length
    })
  } catch (error) {
    console.error('Error fetching talent profiles:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
