import { z } from 'zod'
import type { Prisma, TalentCareerEntry, TalentProfile } from '@prisma/client'
import { getTalentCompletionMissingFields } from './profile-completion'

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()
const average = z.number().finite().min(0).max(1000).nullable().optional()
export const careerCreateSchema = z.object({
  season: z.string().trim().min(4).max(24).regex(/^\d{4}(?:\s*[-/]\s*\d{2,4})?$/, 'Temporada: por ejemplo 2025/26'),
  clubName: z.string().trim().min(1).max(200),
  country: optionalText(100), competition: optionalText(200),
  roleDescription: optionalText(500), notes: optionalText(3000),
  isCurrent: z.boolean().optional(),
  gamesPlayed: z.number().finite().int().min(0).max(10000).nullable().optional(),
  minutesPerGame: z.number().finite().min(0).max(120).nullable().optional(),
  pointsPerGame: average, reboundsPerGame: average, assistsPerGame: average
}).strict()
export const careerUpdateSchema = careerCreateSchema.partial().refine(value => Object.keys(value).length > 0, 'Sin cambios')

export const professionalStatusSchema = z.object({
  contractStatus: z.enum(['NOT_PROVIDED', 'FREE_AGENT', 'UNDER_CONTRACT']).optional(),
  contractUntil: z.string().datetime({ offset: true }).transform(value => new Date(value)).nullable().optional(),
  representationStatus: z.enum(['NOT_PROVIDED', 'UNREPRESENTED', 'REPRESENTED']).optional(),
  representativeName: optionalText(200)
}).strict().refine(value => Object.keys(value).length > 0, 'Sin cambios')

export const evidenceSchema = z.object({
  kind: z.enum(['experience', 'stats', 'passport', 'video', 'fullGame']),
  status: z.enum(['DECLARED', 'CONTRASTED']),
  careerEntryId: z.string().min(1).max(100).optional()
}).strict().superRefine((value, context) => {
  const career = value.kind === 'experience' || value.kind === 'stats'
  if (career !== !!value.careerEntryId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Referencia de experiencia incorrecta' })
})

const experienceFields = ['season', 'clubName', 'country', 'competition', 'roleDescription', 'notes', 'isCurrent'] as const
const statsFields = ['gamesPlayed', 'minutesPerGame', 'pointsPerGame', 'reboundsPerGame', 'assistsPerGame'] as const
// Compare the DB snapshot, not just millisecond timestamps: a concurrent review or
// edit can share updatedAt and must not be overwritten with stale evidence.
export function getCareerWriteGuard(current: TalentCareerEntry): Prisma.TalentCareerEntryWhereInput {
  return { ...current }
}
export function getProfileEvidenceGuard(current: TalentProfile) {
  return {
    updatedAt: current.updatedAt,
    euPassportStatus: current.euPassportStatus,
    videoUrl: current.videoUrl, fullGameUrl: current.fullGameUrl,
    passportEvidenceStatus: current.passportEvidenceStatus,
    passportVerifiedAt: current.passportVerifiedAt, passportVerifiedById: current.passportVerifiedById,
    videoEvidenceStatus: current.videoEvidenceStatus,
    videoVerifiedAt: current.videoVerifiedAt, videoVerifiedById: current.videoVerifiedById,
    fullGameEvidenceStatus: current.fullGameEvidenceStatus,
    fullGameVerifiedAt: current.fullGameVerifiedAt, fullGameVerifiedById: current.fullGameVerifiedById
  }
}
export function getCareerEvidenceReset(current: TalentCareerEntry, patch: z.infer<typeof careerUpdateSchema>): Prisma.TalentCareerEntryUpdateInput {
  const changed = (keys: readonly (keyof typeof patch)[]) => keys.some(key => key in patch && patch[key] !== current[key])
  return {
    ...(changed(experienceFields) ? { experienceEvidenceStatus: 'DECLARED', experienceVerifiedAt: null, experienceVerifiedById: null } : {}),
    ...(changed(statsFields) ? { statsEvidenceStatus: 'DECLARED', statsVerifiedAt: null, statsVerifiedById: null } : {})
  }
}

export function getProfileEvidenceReset(
  current: Pick<TalentProfile, 'euPassportStatus' | 'videoUrl' | 'fullGameUrl'>,
  patch: Partial<Pick<TalentProfile, 'euPassportStatus' | 'videoUrl' | 'fullGameUrl'>>
): Prisma.TalentProfileUpdateInput {
  return {
    ...('euPassportStatus' in patch && patch.euPassportStatus !== current.euPassportStatus ? {
      passportEvidenceStatus: 'DECLARED', passportVerifiedAt: null, passportVerifiedById: null
    } : {}),
    ...('videoUrl' in patch && patch.videoUrl !== current.videoUrl ? {
      videoEvidenceStatus: 'DECLARED', videoVerifiedAt: null, videoVerifiedById: null
    } : {}),
    ...('fullGameUrl' in patch && patch.fullGameUrl !== current.fullGameUrl ? {
      fullGameEvidenceStatus: 'DECLARED', fullGameVerifiedAt: null, fullGameVerifiedById: null
    } : {})
  }
}

export function normalizeProfessionalStatus(current: Pick<TalentProfile, 'contractStatus' | 'representationStatus'>, patch: z.infer<typeof professionalStatusSchema>) {
  const contract = patch.contractStatus ?? current.contractStatus
  const representation = patch.representationStatus ?? current.representationStatus
  return {
    ...patch,
    ...(contract !== 'UNDER_CONTRACT' ? { contractUntil: null } : {}),
    ...(representation !== 'REPRESENTED' ? { representativeName: null } : {})
  }
}

type ReadinessProfile = Parameters<typeof getTalentCompletionMissingFields>[0] & {
  nationality?: string | null
  euPassportStatus?: string | null
  videoUrl?: string | null
  fullGameUrl?: string | null
  contractStatus?: string | null
  representationStatus?: string | null
  careerEntries?: { season?: string | null; clubName?: string | null; competition?: string | null }[]
}
export function getScoutingReadiness(profile: ReadinessProfile): { status: 'BASIC' | 'SCOUTING_READY'; missing: string[] } {
  const text = (value?: string | null) => !!value?.trim()
  const missing = getTalentCompletionMissingFields(profile)
  if (!text(profile.nationality)) missing.push('Nacionalidad')
  if (!['YES', 'NO'].includes(profile.euPassportStatus ?? '')) missing.push('Pasaporte UE')
  if (!profile.careerEntries?.some(entry => text(entry.season) && text(entry.clubName) && text(entry.competition))) missing.push('Trayectoria con temporada, club y competición')
  if (!text(profile.videoUrl) && !text(profile.fullGameUrl)) missing.push('Vídeo')
  if (!['FREE_AGENT', 'UNDER_CONTRACT'].includes(profile.contractStatus ?? '')) missing.push('Situación contractual')
  if (!['UNREPRESENTED', 'REPRESENTED'].includes(profile.representationStatus ?? '')) missing.push('Situación de representación')
  return { status: missing.length === 0 ? 'SCOUTING_READY' : 'BASIC', missing }
}

// Explicit whitelist: reviewer references and technical timestamps never enter public responses.
export const publicCareerSelect = {
  season: true, clubName: true, country: true, competition: true,
  roleDescription: true, notes: true, isCurrent: true,
  gamesPlayed: true, minutesPerGame: true, pointsPerGame: true,
  reboundsPerGame: true, assistsPerGame: true,
  experienceEvidenceStatus: true, statsEvidenceStatus: true
} satisfies Prisma.TalentCareerEntrySelect
export function toPublicCareerEntry(entry: Prisma.TalentCareerEntryGetPayload<{ select: typeof publicCareerSelect }>) {
  return Object.fromEntries(Object.keys(publicCareerSelect).map(key => [key, entry[key as keyof typeof publicCareerSelect]]))
}
