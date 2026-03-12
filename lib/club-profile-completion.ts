type ClubProfileFields = {
  legalName?: string | null
  entityType?: string | null
  city?: string | null
  description?: string | null
  logo?: string | null
}

function hasText(value?: string | null) {
  return typeof value === 'string' && value.trim().length > 0
}

export function calculateClubProfileCompletion(profile: ClubProfileFields) {
  const weightedFields = [
    { filled: hasText(profile.legalName), weight: 25 },
    { filled: hasText(profile.entityType), weight: 15 },
    { filled: hasText(profile.city), weight: 20 },
    { filled: hasText(profile.description), weight: 20 },
    { filled: hasText(profile.logo), weight: 20 }
  ]

  const total = weightedFields.reduce((acc, item) => acc + item.weight, 0)
  const done = weightedFields.reduce((acc, item) => acc + (item.filled ? item.weight : 0), 0)

  return Math.round((done / total) * 100)
}
