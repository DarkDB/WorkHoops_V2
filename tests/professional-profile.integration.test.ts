import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Prisma, PrismaClient } from '@prisma/client'
import { createProfessionalProfileService, ProfessionalProfileError } from '../lib/professional-profile-service'
import { getProfileEvidenceReset } from '../lib/professional-profile'
import { publicPlayerSelect, toPublicPlayerProfile } from '../lib/public-talent-profile'

const connection = process.env.PROFESSIONAL_PROFILE_TEST_DATABASE_URL
if (connection) {
  const url = new URL(connection)
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/professional_profile_test') throw new Error('Integration tests require the isolated local harness')
}

test('isolated PostgreSQL: migrations, ownership, evidence, public DTO, RLS and cascade', { skip: !connection }, async t => {
  const db = new PrismaClient({ datasources: { db: { url: connection } } })
  const service = createProfessionalProfileService(db)
  const owner = { id: '00000000-0000-4000-8000-000000000001', role: 'jugador' as const }
  const admin = { id: 'admin-test', role: 'admin' as const }
  const other = { id: 'other-test', role: 'jugador' as const }
  const profileId = 'historical-test-profile'
  const denied = (status: number) => (error: unknown) => error instanceof ProfessionalProfileError && error.status === status
  try {
    await t.test('historical profile/data/defaults preserved; no fabricated career entries', async () => {
      assert.equal(await db.talentProfile.count(), 1)
      const row = await db.talentProfile.findUniqueOrThrow({ where: { id: profileId }, include: { careerEntries: true } })
      assert.equal(row.bio, 'Legacy bio'); assert.equal(row.lastTeam, 'Legacy team')
      assert.equal(row.country, 'France'); assert.equal(row.availabilityStatus, 'AVAILABLE')
      assert.equal(row.profileCompletionPercentage, 100); assert.equal(row.isPublic, false); assert.equal(row.verified, false)
      assert.equal(row.contractStatus, 'NOT_PROVIDED'); assert.equal(row.representationStatus, 'NOT_PROVIDED')
      for (const field of ['contractUntil', 'representativeName', 'passportVerifiedAt', 'passportVerifiedById', 'videoVerifiedAt', 'videoVerifiedById', 'fullGameVerifiedAt', 'fullGameVerifiedById'] as const) assert.equal(row[field], null)
      for (const field of ['passportEvidenceStatus', 'videoEvidenceStatus', 'fullGameEvidenceStatus'] as const) assert.equal(row[field], 'DECLARED')
      assert.deepEqual(row.careerEntries, [])
    })
    await db.user.createMany({ data: [admin, other].map(actor => ({ id: actor.id, role: actor.role, email: `${actor.id}@example.invalid` })) })
    const career = await service.create(owner, { season: '2025/26', clubName: 'Example team', competition: 'Nacional', pointsPerGame: 10 })
    await t.test('owner CRUD, multiple clubs in same season; other player, club, agency denied', async () => {
      const extra = await service.create(owner, { season: '2025/26', clubName: 'Other team' })
      assert.equal((await service.list(owner)).length, 2)
      await service.update(owner, extra.id, { roleDescription: 'Sparring partner' })
      await service.remove(owner, extra.id)
      for (const actor of [other, { id: owner.id, role: 'club' as const }, { id: owner.id, role: 'agencia' as const }, { id: owner.id, role: 'entrenador' as const }]) {
        const status = actor.role === 'jugador' ? 404 : 403
        await assert.rejects(service.list(actor, profileId), denied(status))
        await assert.rejects(service.create(actor, { season: '2025/26', clubName: 'Forbidden' }, profileId), denied(status))
        await assert.rejects(service.update(actor, career.id, { clubName: 'Forbidden' }), denied(status))
        await assert.rejects(service.remove(actor, career.id), denied(status))
        await assert.rejects(service.getStatus(actor, profileId), denied(status))
        await assert.rejects(service.updateStatus(actor, { contractStatus: 'FREE_AGENT' }, profileId), denied(status))
      }
      assert.equal((await service.list(admin, profileId)).length, 1)
      await service.update(admin, career.id, { notes: 'Reviewed declared experience' })
    })
    await t.test('only admin can contrast; changed experience/statistics invalidate independently', async () => {
      for (const actor of [owner, other, { id: 'agency', role: 'agencia' as const }]) await assert.rejects(service.review(actor, profileId, { kind: 'experience', status: 'CONTRASTED', careerEntryId: career.id }), denied(403))
      await assert.rejects(service.create(owner, { season: '2025/26', clubName: 'Forged', experienceEvidenceStatus: 'CONTRASTED' }))
      const before = await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })
      for (const payload of [
        { pointsPerGame: 99, statsEvidenceStatus: 'CONTRASTED' },
        { clubName: 'Forged', experienceVerifiedAt: '2026-01-01T00:00:00Z' },
        { statsVerifiedById: admin.id }, { experienceVerifiedById: admin.id },
        { talentProfileId: 'other-profile' }
      ]) await assert.rejects(service.update(owner, career.id, payload))
      assert.deepEqual(await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } }), before)
      const beforeStatus = await service.getStatus(owner)
      await assert.rejects(service.updateStatus(owner, { contractStatus: 'FREE_AGENT', passportEvidenceStatus: 'CONTRASTED' }))
      assert.deepEqual(await service.getStatus(owner), beforeStatus)
      await service.review(admin, profileId, { kind: 'experience', status: 'CONTRASTED', careerEntryId: career.id })
      await service.review(admin, profileId, { kind: 'stats', status: 'CONTRASTED', careerEntryId: career.id })
      let row = await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })
      assert.equal(row.experienceVerifiedById, admin.id); assert.ok(row.experienceVerifiedAt)
      assert.equal(row.statsVerifiedById, admin.id); assert.ok(row.statsVerifiedAt)
      await service.update(owner, career.id, { clubName: 'Updated team' })
      row = await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })
      assert.equal(row.experienceEvidenceStatus, 'DECLARED'); assert.equal(row.experienceVerifiedById, null); assert.equal(row.experienceVerifiedAt, null)
      assert.equal(row.statsEvidenceStatus, 'CONTRASTED')
      await service.update(owner, career.id, { pointsPerGame: 11 })
      row = await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })
      assert.equal(row.statsEvidenceStatus, 'DECLARED'); assert.equal(row.statsVerifiedById, null); assert.equal(row.statsVerifiedAt, null)
      await service.review(admin, profileId, { kind: 'experience', status: 'CONTRASTED', careerEntryId: career.id })
      await service.update(owner, career.id, { clubName: 'Updated team' })
      assert.equal((await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })).experienceEvidenceStatus, 'CONTRASTED')
    })
    await t.test('status clearing and evidence provenance; verified/publication/completion unchanged', async () => {
      await service.updateStatus(owner, { contractStatus: 'UNDER_CONTRACT', contractUntil: '2027-01-01T00:00:00Z', representationStatus: 'REPRESENTED', representativeName: 'Example representative' })
      await service.updateStatus(owner, { contractStatus: 'FREE_AGENT', representationStatus: 'UNREPRESENTED' })
      const status = await service.getStatus(owner)
      assert.equal(status.contractUntil, null); assert.equal(status.representativeName, null)
      await assert.rejects(service.review(admin, profileId, { kind: 'passport', status: 'CONTRASTED' }), denied(400))
      await db.talentProfile.update({ where: { id: profileId }, data: { euPassportStatus: 'YES', videoUrl: 'https://example.invalid/video', fullGameUrl: 'https://example.invalid/full' } })
      for (const kind of ['passport', 'video', 'fullGame']) await service.review(admin, profileId, { kind, status: 'CONTRASTED' })
      let row = await db.talentProfile.findUniqueOrThrow({ where: { id: profileId } })
      assert.equal(row.passportVerifiedById, admin.id); assert.equal(row.videoVerifiedById, admin.id); assert.equal(row.fullGameVerifiedById, admin.id)
      await db.talentProfile.update({ where: { id: profileId, updatedAt: row.updatedAt }, data: { videoUrl: 'https://example.invalid/new', ...getProfileEvidenceReset(row, { videoUrl: 'https://example.invalid/new' }) } })
      row = await db.talentProfile.findUniqueOrThrow({ where: { id: profileId } })
      assert.equal(row.videoEvidenceStatus, 'DECLARED'); assert.equal(row.videoVerifiedById, null)
      assert.equal(row.passportEvidenceStatus, 'CONTRASTED'); assert.equal(row.fullGameEvidenceStatus, 'CONTRASTED')
      assert.equal(row.isPublic, false); assert.equal(row.verified, false); assert.equal(row.profileCompletionPercentage, 100)
      assert.equal(row.availabilityConfirmedAt, null)
      const selected = await db.talentProfile.findUniqueOrThrow({ where: { id: profileId }, select: publicPlayerSelect })
      assert.equal(toPublicPlayerProfile(selected), null)
      const dto = toPublicPlayerProfile({ ...selected, isPublic: true })!
      assert.equal(dto.careerEntries.length, 1)
      assert.equal(JSON.stringify(dto).includes('VerifiedById'), false)
    })
    await t.test('same-timestamp concurrent statistics change cannot retain stale contrasted evidence', async () => {
      await service.review(admin, profileId, { kind: 'stats', status: 'CONTRASTED', careerEntryId: career.id })
      const racedDb = new Proxy(db, {
        get(target, key) {
          if (key !== 'talentCareerEntry') return Reflect.get(target, key)
          return new Proxy(target.talentCareerEntry, {
            get(delegate, method) {
              if (method !== 'updateMany') return Reflect.get(delegate, method)
              return async (args: Prisma.TalentCareerEntryUpdateManyArgs) => {
                // Model an interleaving edit/review that shares the same millisecond.
                await db.$executeRaw`UPDATE talent_career_entries SET "pointsPerGame" = 12 WHERE id = ${career.id}`
                return delegate.updateMany(args)
              }
            }
          })
        }
      })
      await assert.rejects(createProfessionalProfileService(racedDb).update(owner, career.id, { pointsPerGame: 11 }), denied(409))
      const row = await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })
      assert.equal(row.pointsPerGame, 12)
      assert.equal(row.statsEvidenceStatus, 'CONTRASTED')
      await service.update(owner, career.id, { pointsPerGame: 11 })
      assert.equal((await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })).statsEvidenceStatus, 'DECLARED')
    })
    await t.test('migration history, pgcrypto and career RLS deny direct access', async () => {
      const migrations = await db.$queryRaw<{ migration_name: string; finished_at: Date; rolled_back_at: Date | null }[]>`SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY migration_name`
      assert.deepEqual(migrations.map(row => row.migration_name), ['0_production_baseline', '20260901_recruiting_basics_v1', '20261006_professional_profile_v1'])
      assert.ok(migrations.every(row => row.finished_at && row.rolled_back_at === null))
      const extensions = await db.$queryRaw<{ extname: string }[]>`SELECT extname FROM pg_extension WHERE extname = 'pgcrypto'`
      assert.equal(extensions.length, 1)
      await db.$queryRaw`SELECT gen_random_uuid()`
      const tables = await db.$queryRaw<{ relrowsecurity: boolean }[]>`SELECT relrowsecurity FROM pg_class WHERE oid = 'public.talent_career_entries'::regclass`
      assert.equal(tables[0].relrowsecurity, true)
      // Simulate permissive Supabase default table grants; RLS must still deny access.
      await db.$executeRawUnsafe('GRANT SELECT, INSERT, UPDATE, DELETE ON talent_career_entries TO anon, authenticated')
      for (const role of ['anon', 'authenticated']) {
        await db.$transaction(async tx => {
          await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
          assert.deepEqual(await tx.$queryRaw`SELECT season FROM talent_career_entries`, [])
          assert.equal(await tx.$executeRawUnsafe("UPDATE talent_career_entries SET season = '2024/25'"), 0)
        })
      }
    })
    await t.test('direct REST roles cannot read private columns, forge evidence or mutate any profiles/users', async () => {
      const attacker = '00000000-0000-4000-8000-000000000002'
      await db.user.create({ data: { id: attacker, email: 'rest-other@example.invalid', role: 'jugador' } })
      await db.talentProfile.create({ data: { userId: attacker, fullName: 'Other local player', role: 'jugador', city: 'Paris', country: 'France', isPublic: true } })
      // A public row with private metadata must also be protected from REST.
      await db.talentProfile.update({ where: { id: profileId }, data: { isPublic: true, representationStatus: 'REPRESENTED', representativeName: 'Private local representative' } })
      const policies = await db.$queryRaw<{ tablename: string; policyname: string; permissive: string; cmd: string; roles: string[] }[]>`
        SELECT tablename, policyname, permissive, cmd, roles FROM pg_policies
        WHERE policyname IN ('talent_profiles_server_api_only', 'talent_career_entries_server_api_only', 'users_server_api_only', 'accounts_server_api_only', 'sessions_server_api_only', 'verification_tokens_server_api_only', 'otp_tokens_server_api_only')`
      assert.equal(policies.length, 7)
      assert.ok(policies.every(row => row.permissive === 'RESTRICTIVE' && row.cmd === 'ALL' && row.roles.includes('anon') && row.roles.includes('authenticated')))
      // Even future permissive policies cannot override the restrictive guard.
      await db.$executeRawUnsafe('CREATE POLICY test_permissive_career ON talent_career_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)')
      for (const role of ['anon', 'authenticated']) {
        for (const sub of [owner.id, attacker]) {
          await db.$transaction(async tx => {
            await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
            await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${sub}, true)`
            assert.deepEqual(await tx.$queryRaw`SELECT "representativeName", "contractUntil", "passportVerifiedById", "passportVerifiedAt" FROM talent_profiles`, [])
            assert.deepEqual(await tx.$queryRaw`SELECT "experienceVerifiedById", "statsVerifiedAt" FROM talent_career_entries`, [])
            assert.deepEqual(await tx.$queryRaw`SELECT id, role, "passwordHash" FROM users`, [])
            assert.equal(await tx.$executeRaw`UPDATE talent_profiles SET "passportEvidenceStatus" = 'CONTRASTED', "passportVerifiedById" = 'forged', "contractStatus" = 'FREE_AGENT'`, 0)
            assert.equal(await tx.$executeRaw`UPDATE talent_career_entries SET "pointsPerGame" = 99, "statsEvidenceStatus" = 'CONTRASTED', "statsVerifiedById" = 'forged'`, 0)
            assert.equal(await tx.$executeRaw`UPDATE users SET role = 'admin' WHERE id = ${sub}`, 0)
            assert.equal(await tx.$executeRaw`DELETE FROM talent_profiles`, 0)
            assert.equal(await tx.$executeRaw`DELETE FROM talent_career_entries`, 0)
            assert.equal(await tx.$executeRaw`DELETE FROM users`, 0)
          })
          for (const target of [profileId, (await db.talentProfile.findUniqueOrThrow({ where: { userId: attacker } })).id]) {
            await assert.rejects(db.$transaction(async tx => {
              await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
              await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${sub}, true)`
              await tx.$executeRaw`INSERT INTO talent_career_entries (id, "talentProfileId", season, "clubName", "updatedAt", "statsEvidenceStatus") VALUES ('forged', ${target}, '2025/26', 'Forged', CURRENT_TIMESTAMP, 'CONTRASTED')`
            }), (error: unknown) => error instanceof Error && error.message.includes('row-level security'))
          }
          await assert.rejects(db.$transaction(async tx => {
            await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
            await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${sub}, true)`
            await tx.$executeRaw`INSERT INTO talent_profiles (id, "userId", "fullName", role, city, "updatedAt", "passportEvidenceStatus") VALUES ('forged', ${sub}, 'Forged', 'jugador', 'Paris', CURRENT_TIMESTAMP, 'CONTRASTED')`
          }), (error: unknown) => error instanceof Error && error.message.includes('row-level security'))
          await assert.rejects(db.$transaction(async tx => {
            await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
            await tx.$executeRaw`INSERT INTO users (id, email, role) VALUES ('forged-user', 'forged@example.invalid', 'admin')`
          }), (error: unknown) => error instanceof Error && error.message.includes('row-level security'))
        }
      }
      assert.equal((await db.talentProfile.findUniqueOrThrow({ where: { id: profileId } })).representativeName, 'Private local representative')
      assert.equal((await db.user.findUniqueOrThrow({ where: { id: owner.id } })).role, 'jugador')
      assert.equal((await db.talentCareerEntry.findUniqueOrThrow({ where: { id: career.id } })).pointsPerGame, 11)
      await db.$executeRawUnsafe('DROP POLICY test_permissive_career ON talent_career_entries')
    })
    await t.test('authentication tables are server-only; REST cannot forge identity or read verification material', async () => {
      const expires = new Date(Date.now() + 600000)
      await db.account.create({ data: { id: 'local-auth-account', userId: owner.id, type: 'oauth', provider: 'local-fixture', providerAccountId: 'local-fixture', access_token: 'synthetic-test-value' } })
      await db.session.create({ data: { id: 'local-auth-session', userId: owner.id, sessionToken: 'synthetic-session-value', expires } })
      await db.verificationToken.create({ data: { identifier: 'historical@example.invalid', token: 'synthetic-verification-value', expires } })
      await db.otpToken.create({ data: { userId: owner.id, tokenHash: 'synthetic-invalid-hash', expiresAt: expires } })
      for (const role of ['anon', 'authenticated']) {
        await db.$transaction(async tx => {
          await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
          await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${owner.id}, true)`
          assert.deepEqual(await tx.$queryRaw`SELECT "access_token" FROM accounts`, [])
          assert.deepEqual(await tx.$queryRaw`SELECT "sessionToken" FROM sessions`, [])
          assert.deepEqual(await tx.$queryRaw`SELECT token FROM verification_tokens`, [])
          assert.deepEqual(await tx.$queryRaw`SELECT token_hash FROM otp_tokens`, [])
          assert.equal(await tx.$executeRaw`UPDATE accounts SET "providerAccountId" = 'forged'`, 0)
          assert.equal(await tx.$executeRaw`UPDATE sessions SET "sessionToken" = 'forged'`, 0)
          assert.equal(await tx.$executeRaw`UPDATE verification_tokens SET token = 'forged'`, 0)
          assert.equal(await tx.$executeRaw`UPDATE otp_tokens SET token_hash = 'forged'`, 0)
          for (const table of ['accounts', 'sessions', 'verification_tokens', 'otp_tokens']) assert.equal(await tx.$executeRawUnsafe(`DELETE FROM ${table}`), 0)
        })
        for (const sql of [
          `INSERT INTO accounts (id, "userId", type, provider, "providerAccountId") VALUES ('forged-auth', '${owner.id}', 'oauth', 'forged', 'forged')`,
          `INSERT INTO sessions (id, "userId", "sessionToken", expires) VALUES ('forged-auth', '${owner.id}', 'forged', CURRENT_TIMESTAMP)`,
          "INSERT INTO verification_tokens (identifier, token, expires) VALUES ('forged@example.invalid', 'forged', CURRENT_TIMESTAMP)",
          `INSERT INTO otp_tokens (user_id, token_hash, expires_at) VALUES ('${owner.id}', 'forged', CURRENT_TIMESTAMP)`
        ]) {
          await assert.rejects(db.$transaction(async tx => {
            await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`)
            await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${owner.id}, true)`
            await tx.$executeRawUnsafe(sql)
          }), (error: unknown) => error instanceof Error && error.message.includes('row-level security'))
        }
      }
      assert.equal((await db.account.findUniqueOrThrow({ where: { id: 'local-auth-account' } })).providerAccountId, 'local-fixture')
      assert.equal((await db.session.findUniqueOrThrow({ where: { id: 'local-auth-session' } })).sessionToken, 'synthetic-session-value')
      assert.equal(await db.verificationToken.count(), 1)
      assert.equal(await db.otpToken.count(), 1)
    })
    await t.test('admin CRUD and foreign key cascade remove only linked entries', async () => {
      const created = await service.create(admin, { season: '2024/25', clubName: 'Admin declared' }, profileId)
      await service.update(admin, created.id, { roleDescription: 'Sparring partner' })
      await service.remove(admin, created.id)
      await db.talentProfile.delete({ where: { id: profileId } })
      assert.equal(await db.talentCareerEntry.count({ where: { talentProfileId: profileId } }), 0)
    })
  } finally { await db.$disconnect() }
})
