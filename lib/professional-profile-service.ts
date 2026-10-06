import type { PrismaClient, UserRole } from '@prisma/client'
import {
  careerCreateSchema, careerUpdateSchema, evidenceSchema, getCareerEvidenceReset, getCareerWriteGuard, getProfileEvidenceGuard,
  normalizeProfessionalStatus, professionalStatusSchema
} from './professional-profile'

export class ProfessionalProfileError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
export type ProfessionalActor = { id: string; role: UserRole }
export function createProfessionalProfileService(db: PrismaClient) {
  async function profile(actor: ProfessionalActor, profileId?: string) {
    if (actor.role !== 'jugador' && actor.role !== 'admin') throw new ProfessionalProfileError(403, 'No autorizado')
    const row = await db.talentProfile.findFirst({ where: {
      ...(profileId ? { id: profileId } : { userId: actor.id }),
      ...(actor.role !== 'admin' ? { userId: actor.id } : {}), role: 'jugador'
    } })
    if (!row) throw new ProfessionalProfileError(404, 'Perfil no disponible')
    return row
  }
  async function entry(actor: ProfessionalActor, id: string) {
    if (actor.role !== 'jugador' && actor.role !== 'admin') throw new ProfessionalProfileError(403, 'No autorizado')
    const row = await db.talentCareerEntry.findFirst({ where: {
      id, talentProfile: { role: 'jugador', ...(actor.role !== 'admin' ? { userId: actor.id } : {}) }
    } })
    if (!row) throw new ProfessionalProfileError(404, 'Experiencia no disponible')
    return row
  }
  function check(count: number) {
    if (count !== 1) throw new ProfessionalProfileError(409, 'El perfil ha cambiado. Recarga e inténtalo de nuevo')
  }
  return {
    async list(actor: ProfessionalActor, profileId?: string) {
      const row = await profile(actor, profileId)
      return db.talentCareerEntry.findMany({ where: { talentProfileId: row.id }, orderBy: [{ season: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }] })
    },
    async create(actor: ProfessionalActor, input: unknown, profileId?: string) {
      const row = await profile(actor, profileId)
      const data = careerCreateSchema.parse(input)
      // Zod validates these required strings even with legacy strictNullChecks disabled.
      return db.talentCareerEntry.create({ data: { ...data, season: data.season!, clubName: data.clubName!, talentProfileId: row.id } })
    },
    async update(actor: ProfessionalActor, id: string, input: unknown) {
      const row = await entry(actor, id)
      const patch = careerUpdateSchema.parse(input)
      const result = await db.talentCareerEntry.updateMany({ where: getCareerWriteGuard(row), data: { ...patch, ...getCareerEvidenceReset(row, patch) } })
      check(result.count)
      return db.talentCareerEntry.findUnique({ where: { id: row.id } })
    },
    async remove(actor: ProfessionalActor, id: string) {
      const row = await entry(actor, id)
      check((await db.talentCareerEntry.deleteMany({ where: getCareerWriteGuard(row) })).count)
    },
    async getStatus(actor: ProfessionalActor, profileId?: string) {
      const row = await profile(actor, profileId)
      return { contractStatus: row.contractStatus, contractUntil: row.contractUntil, representationStatus: row.representationStatus, representativeName: row.representativeName }
    },
    async updateStatus(actor: ProfessionalActor, input: unknown, profileId?: string) {
      const row = await profile(actor, profileId)
      const patch = normalizeProfessionalStatus(row, professionalStatusSchema.parse(input))
      check((await db.talentProfile.updateMany({ where: {
        id: row.id, ...getProfileEvidenceGuard(row), contractStatus: row.contractStatus,
        contractUntil: row.contractUntil, representationStatus: row.representationStatus,
        representativeName: row.representativeName
      }, data: patch })).count)
      return this.getStatus(actor, row.id)
    },
    async review(actor: ProfessionalActor, profileId: string, input: unknown) {
      if (actor.role !== 'admin') throw new ProfessionalProfileError(403, 'No autorizado')
      const row = await profile(actor, profileId)
      const patch = evidenceSchema.parse(input)
      const reviewedAt = patch.status === 'CONTRASTED' ? new Date() : null
      const reviewer = patch.status === 'CONTRASTED' ? actor.id : null
      if (patch.kind === 'experience' || patch.kind === 'stats') {
        const career = await db.talentCareerEntry.findFirst({ where: { id: patch.careerEntryId, talentProfileId: row.id } })
        if (!career) throw new ProfessionalProfileError(404, 'Experiencia no disponible')
        if (patch.status === 'CONTRASTED' && patch.kind === 'stats' && [career.gamesPlayed, career.minutesPerGame, career.pointsPerGame, career.reboundsPerGame, career.assistsPerGame].every(value => value === null)) {
          throw new ProfessionalProfileError(400, 'No hay estadísticas para contrastar')
        }
        const data = patch.kind === 'experience'
          ? { experienceEvidenceStatus: patch.status, experienceVerifiedAt: reviewedAt, experienceVerifiedById: reviewer }
          : { statsEvidenceStatus: patch.status, statsVerifiedAt: reviewedAt, statsVerifiedById: reviewer }
        check((await db.talentCareerEntry.updateMany({ where: getCareerWriteGuard(career), data })).count)
      } else {
        const value = patch.kind === 'passport' ? (row.euPassportStatus !== 'NOT_PROVIDED') : patch.kind === 'video' ? !!row.videoUrl?.trim() : !!row.fullGameUrl?.trim()
        if (patch.status === 'CONTRASTED' && !value) throw new ProfessionalProfileError(400, 'No hay información para contrastar')
        const data = patch.kind === 'passport'
          ? { passportEvidenceStatus: patch.status, passportVerifiedAt: reviewedAt, passportVerifiedById: reviewer }
          : patch.kind === 'video'
            ? { videoEvidenceStatus: patch.status, videoVerifiedAt: reviewedAt, videoVerifiedById: reviewer }
            : { fullGameEvidenceStatus: patch.status, fullGameVerifiedAt: reviewedAt, fullGameVerifiedById: reviewer }
        check((await db.talentProfile.updateMany({ where: { id: row.id, ...getProfileEvidenceGuard(row) }, data })).count)
      }
      return { success: true }
    }
  }
}
