import type { Prisma } from '@prisma/client'
import { getScoutingReadiness, publicCareerSelect, toPublicCareerEntry } from './professional-profile'

const playerFields = [
  'id', 'fullName', 'role', 'city', 'country', 'position', 'secondaryPosition',
  'height', 'weight', 'wingspan', 'dominantHand', 'bio', 'currentLevel',
  'lastTeam', 'currentCategory', 'playingStyle', 'languages', 'currentGoal',
  'internationalExperience', 'hasLicense', 'weeklyCommitment', 'willingToTravel',
  'videoUrl', 'fullGameUrl', 'socialUrl', 'photoUrls',
  'verified', 'availabilityStatus', 'availableFrom', 'nationality',
  'euPassportStatus', 'targetCountries', 'relocationPreference', 'isStudent',
  'contractStatus', 'representationStatus', 'passportEvidenceStatus',
  'videoEvidenceStatus', 'fullGameEvidenceStatus'
] as const

const coachFields = [
  'id', 'fullName', 'city', 'nationality', 'languages', 'bio', 'currentLevel',
  'federativeLicense', 'totalExperience', 'currentClub', 'previousClubs',
  'categoriesCoached', 'achievements', 'internationalExp', 'internationalExpDesc',
  'roleExperience', 'nationalTeamExp', 'playingStyle', 'academicDegrees',
  'certifications', 'currentGoal', 'videoUrl',
  'presentationsUrl', 'photoUrls', 'verified', 'trainingPlanning',
  'individualDevelopment', 'offensiveTactics', 'defensiveTactics',
  'groupManagement', 'scoutingAnalysis', 'staffManagement', 'communication',
  'tacticalAdaptability', 'digitalTools', 'physicalPreparation', 'youthDevelopment',
  'leadership', 'teamwork', 'conflictResolution', 'organization', 'adaptability',
  'innovation'
] as const

const skillFields = [
  'threePointShot', 'midRangeShot', 'finishing', 'ballHandling', 'playmaking',
  'offBallMovement', 'individualDefense', 'teamDefense', 'offensiveRebound',
  'defensiveRebound', 'speed', 'athleticism', 'endurance', 'leadership',
  'decisionMaking'
] as const

function selectFields<K extends string>(fields: readonly K[]): Record<K, true> {
  return Object.fromEntries(fields.map(field => [field, true])) as Record<K, true>
}

function pickFields<T, K extends keyof T>(row: T, fields: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const field of fields) result[field] = row[field]
  return result
}

// Lookup-only fields support existing slug aliases but never enter the public DTO.
export const publicPlayerSelect = {
  ...selectFields(playerFields),
  userId: true,
  isPublic: true,
  birthDate: true,
  contractUntil: true,
  careerEntries: { select: publicCareerSelect, orderBy: [{ season: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }] },
  user: { select: { name: true, image: true } },
  playerSkills: { select: selectFields(skillFields) }
} satisfies Prisma.TalentProfileSelect

export const publicCoachSelect = {
  ...selectFields(coachFields),
  userId: true,
  isPublic: true,
  birthYear: true,
  user: { select: { name: true, image: true } }
} satisfies Prisma.CoachProfileSelect

type PlayerRow = Prisma.TalentProfileGetPayload<{ select: typeof publicPlayerSelect }>
type CoachRow = Prisma.CoachProfileGetPayload<{ select: typeof publicCoachSelect }>

function getAge(birthDate: Date | null): number | null {
  if (!birthDate || !Number.isFinite(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--
  return age >= 0 ? age : null
}

export function toPublicPlayerProfile(row: PlayerRow) {
  if (row.isPublic !== true) return null
  return {
    ...pickFields(row, playerFields),
    contractUntil: row.contractStatus === 'UNDER_CONTRACT' ? row.contractUntil : null,
    careerEntries: (row.careerEntries ?? []).map(toPublicCareerEntry),
    scoutingReadiness: getScoutingReadiness(row),
    age: getAge(row.birthDate),
    image: row.user.image,
    playerSkills: row.playerSkills ? pickFields(row.playerSkills, skillFields) : null
  }
}

export function toPublicCoachProfile(row: CoachRow) {
  if (row.isPublic !== true) return null
  const age = row.birthYear ? new Date().getFullYear() - row.birthYear : null
  return {
    ...pickFields(row, coachFields),
    age: age !== null && age >= 0 ? age : null,
    image: row.user.image
  }
}
