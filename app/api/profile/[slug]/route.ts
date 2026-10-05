import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import {
  publicPlayerSelect,
  publicCoachSelect,
  toPublicPlayerProfile,
  toPublicCoachProfile
} from '@/lib/public-talent-profile'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // Search TalentProfiles
  const talentProfiles = await prisma.talentProfile.findMany({
    where: { isPublic: true },
    select: publicPlayerSelect
  })

  const talentMatch = talentProfiles.find(p => {
    const byFullName = generateSlug(p.fullName) === slug
    const byUserName = p.user.name ? generateSlug(p.user.name) === slug : false
    const withId = generateSlug(p.fullName) + '-' + p.userId.slice(-6) === slug
    return byFullName || byUserName || withId
  })

  const publicTalent = talentMatch ? toPublicPlayerProfile(talentMatch) : null
  if (publicTalent) {
    return NextResponse.json({ type: 'talent', profile: publicTalent })
  }

  // Search CoachProfiles
  const coachProfiles = await prisma.coachProfile.findMany({
    where: { isPublic: true },
    select: publicCoachSelect
  })

  const coachMatch = coachProfiles.find(p => {
    const byFullName = generateSlug(p.fullName) === slug
    const byUserName = p.user.name ? generateSlug(p.user.name) === slug : false
    const withId = generateSlug(p.fullName) + '-' + p.userId.slice(-6) === slug
    return byFullName || byUserName || withId
  })

  const publicCoach = coachMatch ? toPublicCoachProfile(coachMatch) : null
  if (publicCoach) {
    return NextResponse.json({ type: 'coach', profile: publicCoach })
  }

  return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
}
