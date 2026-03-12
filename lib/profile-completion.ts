type TalentCompletionInput = {
  fullName?: string | null
  city?: string | null
  position?: string | null
  height?: number | string | null
  availabilityStatus?: 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE' | null
}

type CoachCompletionInput = {
  fullName?: string | null
  city?: string | null
  currentLevel?: string | null
  totalExperience?: number | null
  currentGoal?: string | null
  availability?: string | null
}

function hasText(value?: string | null) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasNumber(value?: number | string | null) {
  if (typeof value === 'number') return !Number.isNaN(value)
  if (typeof value === 'string') return value.trim().length > 0 && !Number.isNaN(Number(value))
  return false
}

export function calculateTalentProfileCompletion(input: TalentCompletionInput) {
  const checks = [
    { filled: hasText(input.fullName), weight: 22 },
    { filled: hasText(input.position), weight: 22 },
    { filled: hasText(input.city), weight: 20 },
    { filled: hasNumber(input.height), weight: 18 },
    { filled: !!input.availabilityStatus, weight: 18 }
  ]

  const total = checks.reduce((acc, item) => acc + item.weight, 0)
  const done = checks.reduce((acc, item) => acc + (item.filled ? item.weight : 0), 0)
  return Math.round((done / total) * 100)
}

export function getTalentCompletionMissingFields(input: TalentCompletionInput) {
  const missing: string[] = []
  if (!hasText(input.fullName)) missing.push('Nombre completo')
  if (!hasText(input.position)) missing.push('Posición')
  if (!hasText(input.city)) missing.push('Ciudad')
  if (!hasNumber(input.height)) missing.push('Altura')
  if (!input.availabilityStatus) missing.push('Disponibilidad')
  return missing
}

export function calculateCoachProfileCompletion(input: CoachCompletionInput) {
  const checks = [
    { filled: hasText(input.fullName), weight: 20 },
    { filled: hasText(input.city), weight: 20 },
    { filled: hasText(input.currentLevel), weight: 15 },
    { filled: input.totalExperience !== null && input.totalExperience !== undefined, weight: 15 },
    { filled: hasText(input.currentGoal), weight: 15 },
    { filled: hasText(input.availability), weight: 15 }
  ]

  const total = checks.reduce((acc, item) => acc + item.weight, 0)
  const done = checks.reduce((acc, item) => acc + (item.filled ? item.weight : 0), 0)
  return Math.round((done / total) * 100)
}

export function getCoachCompletionMissingFields(input: CoachCompletionInput) {
  const missing: string[] = []
  if (!hasText(input.fullName)) missing.push('Nombre completo')
  if (!hasText(input.city)) missing.push('Ciudad')
  if (!hasText(input.currentLevel)) missing.push('Nivel actual')
  if (input.totalExperience === null || input.totalExperience === undefined) missing.push('Años de experiencia')
  if (!hasText(input.currentGoal)) missing.push('Objetivo profesional')
  if (!hasText(input.availability)) missing.push('Disponibilidad')
  return missing
}
