import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // Search TalentProfiles
  const talentProfiles = await prisma.talentProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, image: true, planType: true }
      },
      playerSkills: true
    }
  })

  const talentMatch = talentProfiles.find(p => {
    const byFullName = generateSlug(p.fullName) === slug
    const byUserName = p.user.name ? generateSlug(p.user.name) === slug : false
    const withId = generateSlug(p.fullName) + '-' + p.userId.slice(-6) === slug
    return byFullName || byUserName || withId
  })

  if (talentMatch) {
    return NextResponse.json({ type: 'talent', profile: talentMatch })
  }

  // Search CoachProfiles
  const coachProfiles = await prisma.coachProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, image: true, planType: true }
      }
    }
  })

  const coachMatch = coachProfiles.find(p => {
    const byFullName = generateSlug(p.fullName) === slug
    const byUserName = p.user.name ? generateSlug(p.user.name) === slug : false
    const withId = generateSlug(p.fullName) + '-' + p.userId.slice(-6) === slug
    return byFullName || byUserName || withId
  })

  if (coachMatch) {
    return NextResponse.json({ type: 'coach', profile: coachMatch })
  }

  return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
}
