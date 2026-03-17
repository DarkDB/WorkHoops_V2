import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'

function sanitizeSlugValue(value: string) {
  const slug = generateSlug(value || 'club')
  return slug.length > 0 ? slug : 'club'
}

export function shouldRegenerateClubSlug(currentSlug?: string | null, nextBaseValue?: string | null) {
  if (!currentSlug) {
    return true
  }

  const nextBaseSlug = sanitizeSlugValue(nextBaseValue || 'club')

  // Existing fallback slugs should be replaced once the club provides a real name.
  if (/^club(?:-\d+)?$/.test(currentSlug) && nextBaseSlug !== 'club') {
    return true
  }

  return false
}

export async function generateUniqueClubSlug(baseValue: string, excludeProfileId?: string) {
  const baseSlug = sanitizeSlugValue(baseValue)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await prisma.clubAgencyProfile.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!existing || (excludeProfileId && existing.id === excludeProfileId)) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}
