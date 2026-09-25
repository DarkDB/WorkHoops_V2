type PublicClubRow = {
  id: string
  verified: boolean
  clubAgencyProfile: {
    slug: string | null
    legalName: string
    commercialName: string | null
    city: string
    logo: string | null
  } | null
  opportunities: { id: string }[]
}

export function toPublicClubListItem(club: PublicClubRow) {
  const profile = club.clubAgencyProfile
  if (!profile?.slug) return null

  return {
    id: club.id,
    name: profile.commercialName || profile.legalName,
    verified: club.verified,
    profile: {
      slug: profile.slug,
      city: profile.city,
      logo: profile.logo
    },
    opportunitiesCount: club.opportunities.length
  }
}

type ContactProfile = {
  fullName: string
  isPublic: boolean | null
  user: { id: string; email: string; name: string | null }
}

export function selectPublicContactTarget<T extends ContactProfile>(
  player: T | null,
  coach: T | null,
  profileUserId: string
): { kind: 'player' | 'coach'; profile: T } | null {
  const profile = player || coach
  if (profile?.isPublic !== true || profile.user.id !== profileUserId) return null
  return { kind: player ? 'player' : 'coach', profile }
}

export function isPublicPlayerProfile(profile: { role: string; isPublic: boolean } | null): boolean {
  return profile?.role === 'jugador' && profile.isPublic === true
}

export function canContactTalent(role?: string): boolean {
  return role === 'club' || role === 'agencia' || role === 'admin'
}
