import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      talentProfile: { select: { fullName: true } },
      coachProfile: { select: { fullName: true } }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const fullName = user.talentProfile?.fullName || user.coachProfile?.fullName || user.name || ''
  const baseSlug = generateSlug(fullName)

  if (!baseSlug) {
    return NextResponse.json({ error: 'Cannot generate slug for this user' }, { status: 400 })
  }

  // Check for slug collisions: find all talent/coach profiles whose name generates the same slug
  const [allTalent, allCoach] = await Promise.all([
    prisma.talentProfile.findMany({
      include: { user: { select: { id: true } } }
    }),
    prisma.coachProfile.findMany({
      include: { user: { select: { id: true } } }
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

  const profileType = user.talentProfile ? 'jugador' : user.coachProfile ? 'entrenador' : null

  return NextResponse.json({
    slug,
    profileType,
    publicUrl: profileType ? `/${profileType}/${slug}` : null
  })
}
