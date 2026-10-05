import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const talent = await prisma.talentProfile.findFirst({
    where: { userId, isPublic: true },
    select: { fullName: true, userId: true }
  })
  const coach = talent ? null : await prisma.coachProfile.findFirst({
    where: { userId, isPublic: true },
    select: { fullName: true, userId: true }
  })
  const profile = talent || coach
  const baseSlug = profile ? generateSlug(profile.fullName) : ''

  if (!baseSlug) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check for slug collisions: find all talent/coach profiles whose name generates the same slug
  const [allTalent, allCoach] = await Promise.all([
    prisma.talentProfile.findMany({
      where: { isPublic: true },
      select: { fullName: true, userId: true }
    }),
    prisma.coachProfile.findMany({
      where: { isPublic: true },
      select: { fullName: true, userId: true }
    })
  ])

  const allProfiles = [
    ...allTalent.map(p => ({ id: p.userId, name: p.fullName })),
    ...allCoach.map(p => ({ id: p.userId, name: p.fullName }))
  ]

  const conflicts = allProfiles.filter(
    p => generateSlug(p.name) === baseSlug && p.id !== userId
  )

  const slug = conflicts.length > 0
    ? `${baseSlug}-${userId.slice(-6)}`
    : baseSlug

  const profileType = talent ? 'jugador' : 'entrenador'

  return NextResponse.json({
    slug,
    profileType,
    publicUrl: `/${profileType}/${slug}`
  })
}
