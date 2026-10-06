import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { TalentCareerEntry, TalentProfile } from '@prisma/client'
import {
  careerCreateSchema, careerUpdateSchema, evidenceSchema, getCareerEvidenceReset,
  getProfileEvidenceReset, getScoutingReadiness, normalizeProfessionalStatus, professionalStatusSchema
} from '../lib/professional-profile'
import { publicPlayerSelect, toPublicPlayerProfile } from '../lib/public-talent-profile'

const ready = {
  fullName: 'Example', city: 'Paris', position: 'Escolta', height: 190,
  availabilityStatus: 'AVAILABLE' as const, nationality: 'Francesa', euPassportStatus: 'YES',
  videoUrl: 'https://example.com/video', contractStatus: 'FREE_AGENT', representationStatus: 'UNREPRESENTED',
  careerEntries: [{ season: '2025/26', clubName: 'Example', competition: 'Nacional' }]
}

test('readiness uses current basic completeness and requires each professional minimum', () => {
  assert.equal(getScoutingReadiness(ready).status, 'SCOUTING_READY')
  for (const patch of [{ fullName: '' }, { city: '' }, { position: null }, { height: null }, { availabilityStatus: null }, { nationality: '' }, { euPassportStatus: 'NOT_PROVIDED' }, { careerEntries: [] }, { careerEntries: [{ season: '2025/26', clubName: 'Example', competition: '' }] }, { contractStatus: 'NOT_PROVIDED' }, { representationStatus: 'NOT_PROVIDED' }, { videoUrl: null }]) {
    const result = getScoutingReadiness({ ...ready, ...patch })
    assert.equal(result.status, 'BASIC')
    assert.ok(result.missing.length > 0)
  }
  assert.equal(getScoutingReadiness({ ...ready, euPassportStatus: 'NO', availabilityStatus: 'NOT_AVAILABLE' }).status, 'SCOUTING_READY')
  assert.equal(getScoutingReadiness({ ...ready, videoUrl: null, fullGameUrl: 'https://example.com/full' }).status, 'SCOUTING_READY')
})

test('career input validates finite reasonable values and rejects evidence/publication injection', () => {
  for (const season of ['2025/26', '2025-2026', '2025', '2025 / 26']) assert.equal(careerCreateSchema.parse({ season, clubName: ' Example ' }).clubName, 'Example')
  for (const patch of [{ season: '' }, { clubName: '' }, { gamesPlayed: -1 }, { gamesPlayed: 1.5 }, { pointsPerGame: Infinity }, { assistsPerGame: NaN }, { reboundsPerGame: -1 }, { pointsPerGame: 1000000 }, { minutesPerGame: 121 }, { notes: 'x'.repeat(3001) }, { experienceEvidenceStatus: 'CONTRASTED' }, { statsEvidenceStatus: 'CONTRASTED' }, { experienceVerifiedById: 'forged' }, { talentProfileId: 'other' }, { isPublic: true }, { verified: true }]) {
    assert.equal(careerCreateSchema.safeParse({ season: '2025/26', clubName: 'Example', ...patch }).success, false)
  }
  assert.equal(careerUpdateSchema.safeParse({}).success, false)
  assert.equal(careerCreateSchema.safeParse({ season: '2025/26', clubName: 'Example', gamesPlayed: 0, minutesPerGame: 45.5 }).success, true)
})

test('professional status clears stale dates and representative names; strict validation', () => {
  const current = { contractStatus: 'UNDER_CONTRACT', representationStatus: 'REPRESENTED' } as TalentProfile
  assert.deepEqual(normalizeProfessionalStatus(current, professionalStatusSchema.parse({ contractStatus: 'FREE_AGENT', contractUntil: '2027-01-01T00:00:00Z', representationStatus: 'UNREPRESENTED', representativeName: 'Example' })), {
    contractStatus: 'FREE_AGENT', contractUntil: null, representationStatus: 'UNREPRESENTED', representativeName: null
  })
  for (const field of ['verified', 'isPublic', 'passportEvidenceStatus', 'passportVerifiedById']) assert.equal(professionalStatusSchema.safeParse({ contractStatus: 'FREE_AGENT', [field]: true }).success, false)
  assert.equal(professionalStatusSchema.safeParse({ contractUntil: 'not-a-date' }).success, false)
  assert.equal(professionalStatusSchema.safeParse({ representativeName: null }).success, true)
})

test('experience and statistics invalidate independently and no-op edits preserve evidence', () => {
  const entry = { season: '2025/26', clubName: 'Example', pointsPerGame: 10 } as TalentCareerEntry
  assert.deepEqual(getCareerEvidenceReset(entry, { pointsPerGame: 10 }), {})
  assert.deepEqual(getCareerEvidenceReset(entry, { clubName: 'Other' }), { experienceEvidenceStatus: 'DECLARED', experienceVerifiedAt: null, experienceVerifiedById: null })
  assert.deepEqual(getCareerEvidenceReset(entry, { pointsPerGame: 11 }), { statsEvidenceStatus: 'DECLARED', statsVerifiedAt: null, statsVerifiedById: null })
})

test('passport/video/full game reset only changed evidence and clear private provenance', () => {
  const current = { euPassportStatus: 'YES', videoUrl: 'old', fullGameUrl: null } as TalentProfile
  assert.deepEqual(getProfileEvidenceReset(current, {}), {})
  assert.deepEqual(getProfileEvidenceReset(current, { euPassportStatus: 'YES', videoUrl: 'old' }), {})
  const result = getProfileEvidenceReset(current, { euPassportStatus: 'NO', videoUrl: null, fullGameUrl: 'new' })
  for (const kind of ['passport', 'video', 'fullGame']) {
    assert.equal(result[`${kind}EvidenceStatus`], 'DECLARED')
    assert.equal(result[`${kind}VerifiedAt`], null)
    assert.equal(result[`${kind}VerifiedById`], null)
  }
})

test('evidence request cannot forge reviewers or reference unrelated resources', () => {
  assert.equal(evidenceSchema.safeParse({ kind: 'experience', status: 'CONTRASTED' }).success, false)
  assert.equal(evidenceSchema.safeParse({ kind: 'video', status: 'CONTRASTED', careerEntryId: 'entry' }).success, false)
  assert.equal(evidenceSchema.safeParse({ kind: 'video', status: 'CONTRASTED', videoVerifiedById: 'forged' }).success, false)
})

test('public DTO includes only allowed professional fields and never exposes review metadata', () => {
  const entry = { ...ready.careerEntries[0], notes: 'Declared trajectory', experienceEvidenceStatus: 'DECLARED', statsEvidenceStatus: 'DECLARED', id: 'internal', talentProfileId: 'private', experienceVerifiedById: 'admin-id', statsVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
  const row = { ...ready, careerEntries: [entry], id: 'public-profile-id', role: 'jugador', isPublic: true, userId: 'private-user', birthDate: null, user: { image: null, email: 'private@example.com' }, playerSkills: null, contractUntil: new Date(), representativeName: 'Private representative', passportVerifiedById: 'private-admin', passportVerifiedAt: new Date(), verified: false }
  const dto = toPublicPlayerProfile(row as unknown as Parameters<typeof toPublicPlayerProfile>[0])!
  assert.equal(dto.contractStatus, 'FREE_AGENT')
  assert.equal(dto.contractUntil, null)
  assert.equal(dto.scoutingReadiness.status, 'SCOUTING_READY')
  assert.equal(dto.careerEntries[0].season, '2025/26')
  const json = JSON.stringify(dto)
  for (const forbidden of ['representativeName', 'private-user', 'private@example.com', 'VerifiedById', 'VerifiedAt', 'createdAt', 'updatedAt', 'talentProfileId', '"internal"']) assert.equal(json.includes(forbidden), false, forbidden)
  assert.equal('representativeName' in publicPlayerSelect, false)
  assert.equal(toPublicPlayerProfile({ ...row, isPublic: false } as unknown as Parameters<typeof toPublicPlayerProfile>[0]), null)
  assert.ok(toPublicPlayerProfile({ ...row, contractStatus: 'UNDER_CONTRACT' } as unknown as Parameters<typeof toPublicPlayerProfile>[0])!.contractUntil)
})
