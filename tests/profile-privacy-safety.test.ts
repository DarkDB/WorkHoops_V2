import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'
import * as publicProfiles from '../lib/public-talent-profile'
import * as slug from '../lib/slug'
import * as completion from '../lib/profile-completion'
import * as physical from '../lib/physical-validations'
import * as technical from '../lib/onboarding-technical-validation'
import * as recruiting from '../lib/recruiting-preferences'

type Handler = (request: Request, context?: { params: { slug: string } }) => Promise<Response>

// Run the actual route source with external services stubbed; no DB/auth/email is loaded.
function loadRoute(path: string, mocks: Record<string, unknown>) {
  const source = readFileSync(resolve(path), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText
  const module = { exports: {} as Record<string, Handler> }
  const require = createRequire(import.meta.url)
  const mockedRequire = (name: string) => {
    if (name in mocks) return mocks[name]
    if (name.startsWith('@/') || name.startsWith('next-auth')) {
      throw new Error(`Unmocked service: ${name}`)
    }
    return require(name)
  }
  new Function('require', 'module', 'exports', compiled)(mockedRequire, module, module.exports)
  return module.exports
}

const publicPlayer = {
  id: 'profile-1', userId: 'private-user-123456', fullName: 'Public Player',
  role: 'jugador', isPublic: true, verified: false, city: 'Paris', country: 'France',
  position: 'Escolta', height: 190, birthDate: new Date('2000-01-01'),
  nationality: 'Francesa', euPassportStatus: 'YES', targetCountries: [],
  videoUrl: 'https://example.com/highlights', fullGameUrl: 'https://example.com/game',
  availabilityStatus: 'AVAILABLE',
  user: { name: 'Account Alias', image: null, id: 'private-user', email: 'private@example.com', planType: 'private-plan' },
  playerSkills: { threePointShot: 4, id: 'private-skills-id', talentProfileId: 'private-relation-id' },
  injuryHistory: 'private-health', createdAt: new Date(), updatedAt: new Date(),
  profileCompletionPercentage: 100, availabilityUpdatedAt: new Date(),
  availabilityConfirmedAt: new Date(), futureInternalField: 'private-new-field'
}

function publicRoute(players: object[], coaches: object[] = []) {
  const findPublic = (rows: object[]) => async (args: {
    where: { isPublic: boolean }, select: Record<string, unknown>
  }) => {
    assert.deepEqual(args.where, { isPublic: true })
    assert.equal(args.select.injuryHistory, undefined)
    return rows.filter(row => (row as { isPublic: boolean }).isPublic === true)
  }
  return loadRoute('app/api/profile/[slug]/route.ts', {
    '@/lib/prisma': { prisma: {
      talentProfile: { findMany: findPublic(players) },
      coachProfile: { findMany: findPublic(coaches) }
    } },
    '@/lib/slug': slug,
    '@/lib/public-talent-profile': publicProfiles
  }).GET
}

test('public player is accessible and DTO excludes private fields even if the DB result contains them', async () => {
  const response = await publicRoute([publicPlayer])(new Request('https://example.com'), {
    params: { slug: 'public-player' }
  })
  assert.equal(response.status, 200)
  const { type, profile } = await response.json()
  assert.equal(type, 'talent')
  assert.equal(profile.id, publicPlayer.id)
  assert.equal(profile.fullName, publicPlayer.fullName)
  assert.equal(profile.fullGameUrl, publicPlayer.fullGameUrl)
  assert.equal(profile.euPassportStatus, 'YES')
  assert.equal(profile.verified, false)
  assert.equal(typeof profile.age, 'number')
  for (const key of ['userId', 'user', 'birthDate', 'isPublic', 'injuryHistory',
    'createdAt', 'updatedAt', 'profileCompletionPercentage', 'availabilityUpdatedAt',
    'availabilityConfirmedAt', 'futureInternalField']) {
    assert.equal(key in profile, false, key)
  }
  assert.deepEqual(profile.playerSkills, { threePointShot: 4 })
  assert.equal(JSON.stringify(profile).includes('private-'), false)
  assert.equal(JSON.stringify(profile).includes('private@example.com'), false)
})

test('existing account-name and ID-suffixed public slug aliases still resolve', async () => {
  const handler = publicRoute([publicPlayer])
  for (const name of ['account-alias', 'public-player-123456']) {
    const response = await handler(new Request('https://example.com'), { params: { slug: name } })
    assert.equal(response.status, 200, name)
  }
})

test('private players return the same 404 as missing profiles', async () => {
  for (const name of ['public-player', 'account-alias', 'public-player-123456', 'missing']) {
    const response = await publicRoute([{ ...publicPlayer, isPublic: false }])(
      new Request('https://example.com'), { params: { slug: name } }
    )
    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), { error: 'Profile not found' })
  }
})

test('public coaches remain accessible through a safe DTO; false/null visibility is unavailable', async () => {
  for (const isPublic of [true, false, null]) {
    const coach = {
      id: 'coach-1', userId: 'private-user', fullName: 'Public Coach', isPublic,
      city: 'Madrid', birthYear: 1990, currentClub: 'Club', videoUrl: 'https://example.com/video',
      verified: true, user: publicPlayer.user, createdAt: new Date(), futureInternalField: 'private-field'
    }
    const response = await publicRoute([], [coach])(new Request('https://example.com'), {
      params: { slug: 'public-coach' }
    })
    assert.equal(response.status, isPublic === true ? 200 : 404)
    if (isPublic === true) {
      const { type, profile } = await response.json()
      assert.equal(type, 'coach')
      assert.equal(profile.currentClub, 'Club')
      assert.equal(profile.verified, true)
      for (const key of ['userId', 'user', 'birthYear', 'isPublic', 'createdAt', 'futureInternalField']) {
        assert.equal(key in profile, false, key)
      }
    }
  }
})

function onboardingRoute(existing: typeof publicPlayer | null) {
  let stored = existing
  let writes = 0
  const save = async ({ data }: { data: Partial<typeof publicPlayer> }) => {
    if (existing) {
      assert.equal('isPublic' in data, false)
      assert.equal('verified' in data, false)
    }
    writes++
    stored = { ...publicPlayer, ...stored, ...data }
    return stored
  }
  const handler = loadRoute('app/api/talent/profile-onboarding/route.ts', {
    'next-auth': { getServerSession: async () => ({ user: { id: publicPlayer.userId, role: 'jugador' } }) },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': { prisma: {
      talentProfile: { findUnique: async () => stored, update: save, create: save },
      playerSkills: { upsert: async () => ({}), create: async () => ({}) },
      user: { findUnique: async () => null }
    } },
    '@/lib/funnel-events': { trackFunnelEvent: async () => undefined },
    '@/lib/profile-completion': completion,
    '@/lib/physical-validations': physical,
    '@/lib/onboarding-technical-validation': technical,
    '@/lib/recruiting-preferences': recruiting
  }).POST
  return { handler, getWrites: () => writes }
}

function editRequest(extra: object = {}) {
  return new Request('https://example.com/api/talent/profile-onboarding', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Public Player', city: 'Paris', position: 'Escolta',
      height: 190, availabilityStatus: 'AVAILABLE', bio: 'Updated bio', ...extra })
  })
}

test('editing public/private players preserves visibility and verification, including submitted publication flags', async () => {
  for (const isPublic of [true, false]) {
    for (const verified of [true, false]) {
      const route = onboardingRoute({ ...publicPlayer, isPublic, verified })
      const response = await route.handler(editRequest({ isPublic: !isPublic, verified: !verified }))
      assert.equal(response.status, 200)
      const { profile } = await response.json()
      assert.equal(profile.isPublic, isPublic)
      assert.equal(profile.verified, verified)
      assert.equal(profile.bio, 'Updated bio')
      assert.equal(route.getWrites(), 1)
    }
  }
})

test('invalid onboarding edits do not write or publish a private profile', async () => {
  const route = onboardingRoute({ ...publicPlayer, isPublic: false })
  const response = await route.handler(editRequest({ fullName: '', isPublic: true }))
  assert.equal(response.status, 400)
  assert.equal(route.getWrites(), 0)
})

test('new profiles retain existing public creation behavior without changing verification', async () => {
  const route = onboardingRoute(null)
  const response = await route.handler(editRequest())
  assert.equal(response.status, 200)
  const { profile } = await response.json()
  assert.equal(profile.isPublic, true)
  assert.equal(profile.verified, false)
  assert.equal(route.getWrites(), 1)
})

type SlugProfile = { userId: string, fullName: string, isPublic: boolean | null }

function slugRoute(players: SlugProfile[], coaches: SlugProfile[] = []) {
  const model = (rows: SlugProfile[]) => ({
    findFirst: async ({ where, select }: {
      where: { userId: string, isPublic: boolean }, select: object
    }) => {
      assert.equal(where.isPublic, true)
      assert.deepEqual(select, { fullName: true, userId: true })
      return rows.find(row => row.userId === where.userId && row.isPublic === true) || null
    },
    findMany: async ({ where, select }: { where: object, select: object }) => {
      assert.deepEqual(where, { isPublic: true })
      assert.deepEqual(select, { fullName: true, userId: true })
      return rows.filter(row => row.isPublic === true)
    }
  })
  return loadRoute('app/api/profile/slug/route.ts', {
    '@/lib/prisma': { prisma: { talentProfile: model(players), coachProfile: model(coaches) } },
    '@/lib/slug': slug
  }).GET
}

test('slug resolution returns only public link data for players and coaches', async () => {
  const row = { userId: 'user-123456', fullName: 'Public Profile', isPublic: true }
  for (const type of ['jugador', 'entrenador']) {
    const handler = type === 'jugador' ? slugRoute([row]) : slugRoute([], [row])
    const response = await handler(new Request(`https://example.com/api/profile/slug?userId=${row.userId}`))
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      slug: 'public-profile', profileType: type, publicUrl: `/${type}/public-profile`
    })
  }
})

test('private, null-visibility and missing profiles have indistinguishable slug responses', async () => {
  for (const isPublic of [false, null]) {
    const row = { userId: 'user-123456', fullName: 'Private Name', isPublic }
    for (const handler of [slugRoute([row]), slugRoute([], [row]), slugRoute([])]) {
      const response = await handler(new Request(`https://example.com/api/profile/slug?userId=${row.userId}`))
      assert.equal(response.status, 404)
      assert.deepEqual(await response.json(), { error: 'Profile not found' })
      assert.equal(response.headers.get('content-type'), 'application/json')
    }
  }
})

test('slug collisions consider public profiles only and preserve existing suffix convention', async () => {
  const row = { userId: 'user-123456', fullName: 'Shared Name', isPublic: true }
  for (const isPublic of [true, false]) {
    const response = await slugRoute([row], [{ ...row, userId: 'other', isPublic }])(
      new Request(`https://example.com/api/profile/slug?userId=${row.userId}`)
    )
    const data = await response.json()
    assert.equal(data.slug, isPublic ? 'shared-name-123456' : 'shared-name')
  }
})

type StoredCoach = { userId: string, fullName: string, isPublic: boolean | null, verified: boolean | null }

function coachOnboarding(existing: StoredCoach | null) {
  let stored = existing
  let writes = 0
  const save = async ({ data }: { data: Partial<StoredCoach> }) => {
    assert.equal('verified' in data, false)
    if (existing) assert.equal('isPublic' in data, false)
    writes++
    stored = { userId: 'coach-user', fullName: '', isPublic: false, verified: false, ...stored, ...data }
    return stored
  }
  const handler = loadRoute('app/api/coach/profile-onboarding/route.ts', {
    'next-auth': { getServerSession: async () => ({ user: { id: 'coach-user', role: 'entrenador' } }) },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': { prisma: {
      coachProfile: { findUnique: async () => stored, update: save, create: save },
      user: { findUnique: async () => null }
    } },
    '@/lib/profile-completion': completion
  }).POST
  return { handler, getWrites: () => writes }
}

test('coach edits preserve public/private/null visibility and verification despite injected flags', async () => {
  for (const isPublic of [true, false, null]) {
    for (const verified of [true, false, null]) {
      const route = coachOnboarding({ userId: 'coach-user', fullName: 'Coach', isPublic, verified })
      const response = await route.handler(editRequest({ fullName: 'Updated Coach', isPublic: !isPublic, verified: !verified }))
      assert.equal(response.status, 200)
      const { profile } = await response.json()
      assert.equal(profile.isPublic, isPublic)
      assert.equal(profile.verified, verified)
      assert.equal(profile.fullName, 'Updated Coach')
      assert.equal(route.getWrites(), 1)
    }
  }
})

test('new coach profiles retain existing public creation behavior without accepting verification flags', async () => {
  const route = coachOnboarding(null)
  const response = await route.handler(editRequest({ fullName: 'Coach', verified: true }))
  assert.equal(response.status, 200)
  const { profile } = await response.json()
  assert.equal(profile.isPublic, true)
  assert.equal(profile.verified, false)
  assert.equal(route.getWrites(), 1)
})

test('retired bulk-publication route denies anonymous/non-admin callers and cannot write for admins', async () => {
  for (const role of [null, 'jugador', 'entrenador', 'club', 'agencia', 'admin']) {
    const handler = loadRoute('app/api/admin/fix-public-profiles/route.ts', {
      'next-auth': { getServerSession: async () => role ? { user: { id: 'user', role } } : null },
      '@/lib/auth': { authOptions: {} }
    }).POST
    const response = await handler(new Request('https://example.com/api/admin/fix-public-profiles', {
      method: 'POST', body: JSON.stringify({ confirm: true, isPublic: true })
    }))
    assert.equal(response.status, role === 'admin' ? 410 : 403)
    assert.deepEqual(await response.json(), role === 'admin'
      ? { error: 'Esta utilidad de publicación masiva ha sido retirada.' }
      : { error: 'No autorizado' })
  }
})

function interestRoute(visibility: boolean | null | 'missing', authenticated = true) {
  const effects = { notifications: 0, emails: 0, reads: 0 }
  const handler = loadRoute('app/api/talent/notify-interest/route.ts', {
    'next-auth/next': { getServerSession: async () => authenticated
      ? { user: { id: 'sender', name: 'Sender' } } : null },
    '@/lib/auth': { authOptions: {} },
    '@/lib/rate-limit': {
      rateLimitByUser: async () => ({ success: true }),
      getRateLimitHeaders: () => ({ 'X-RateLimit-Remaining': '2' })
    },
    '@/lib/prisma': { prisma: {
      talentProfile: { findFirst: async (args: { where: object, select: object }) => {
        effects.reads++
        assert.deepEqual(args.where, { id: 'target', isPublic: true })
        assert.deepEqual(args.select, {
          fullName: true, user: { select: { planType: true, email: true, name: true } }
        })
        return visibility === true ? {
          fullName: 'Public Player', user: { name: 'Player', email: 'private@example.com', planType: 'free' }
        } : null
      } },
      interestNotification: { create: async ({ data }: { data: object }) => {
        assert.deepEqual(data, { profileId: 'target', interestedUserId: 'sender', status: 'pending' })
        effects.notifications++
      } }
    } },
    '@/lib/email': { sendInterestNotificationEmail: async () => { effects.emails++ } }
  }).POST
  return { handler, effects }
}

function interestRequest() {
  return new Request('https://example.com/api/talent/notify-interest', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'target', profileUserId: 'ignored-user' })
  })
}

test('public interest keeps notification/email delivery without exposing contact data', async () => {
  const route = interestRoute(true)
  const response = await route.handler(interestRequest())
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.success, true)
  assert.deepEqual(route.effects, { notifications: 1, emails: 1, reads: 1 })
  for (const secret of ['private@example.com', 'target', 'ignored-user', 'Public Player']) {
    assert.equal(JSON.stringify(data).includes(secret), false)
  }
})

test('private/null/missing interest targets return identical 404s and never notify or email', async () => {
  const outcomes = []
  for (const visibility of [false, null, 'missing'] as const) {
    const route = interestRoute(visibility)
    const response = await route.handler(interestRequest())
    outcomes.push({ status: response.status, headers: Array.from(response.headers.entries()), body: await response.json() })
    assert.deepEqual(route.effects, { notifications: 0, emails: 0, reads: 1 })
  }
  assert.equal(outcomes[0].status, 404)
  assert.deepEqual(outcomes[0].body, { message: 'Perfil no encontrado' })
  assert.deepEqual(outcomes[0], outcomes[1])
  assert.deepEqual(outcomes[0], outcomes[2])
})

test('interest remains protected by authentication', async () => {
  const route = interestRoute(true, false)
  const response = await route.handler(interestRequest())
  assert.equal(response.status, 401)
  assert.deepEqual(route.effects, { notifications: 0, emails: 0, reads: 0 })
})

function viewRoute(visibility: boolean | null | 'missing', viewer: string | null = null, duplicate = false) {
  const effects = { views: 0, notifications: 0, analyticsReads: 0 }
  const lookup = async ({ where, select }: { where: object, select: object }) => {
    assert.deepEqual(where, { userId: 'target-user', isPublic: true })
    assert.deepEqual(select, { id: true })
    return visibility === true ? { id: 'internal-profile-id' } : null
  }
  const handler = loadRoute('app/api/profile/view/route.ts', {
    'next-auth/next': { getServerSession: async () => viewer ? { user: { id: viewer } } : null },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': { prisma: {
      talentProfile: { findFirst: lookup }, coachProfile: { findFirst: lookup },
      profileView: {
        findFirst: async () => { effects.analyticsReads++; return duplicate ? { id: 'view' } : null },
        create: async ({ data }: { data: { profileUserId: string, viewerUserId: string | null } }) => {
          assert.equal(data.profileUserId, 'target-user')
          assert.equal(data.viewerUserId, viewer)
          effects.views++
        },
        count: async () => { effects.analyticsReads++; return 1 }
      }
    } },
    '@/lib/notifications': { createNotification: async () => { effects.notifications++ } }
  }).POST
  return { handler, effects }
}

function viewRequest(profileType = 'jugador') {
  return new Request('https://example.com/api/profile/view', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '192.0.2.1' },
    body: JSON.stringify({ profileUserId: 'target-user', profileType })
  })
}

test('public players/coaches still record anonymous visits and milestone notifications', async () => {
  for (const type of ['jugador', 'entrenador']) {
    const route = viewRoute(true)
    const response = await route.handler(viewRequest(type))
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { counted: true, viewsToday: 1 })
    assert.deepEqual(route.effects, { views: 1, notifications: 1, analyticsReads: 2 })
  }
})

test('private/null/missing player and coach visits have identical responses and zero analytics/notifications', async () => {
  for (const type of ['jugador', 'entrenador']) {
    for (const viewer of [null, 'target-user']) {
      const outcomes = []
      for (const visibility of [false, null, 'missing'] as const) {
        const route = viewRoute(visibility, viewer)
        const response = await route.handler(viewRequest(type))
        outcomes.push({ status: response.status, headers: Array.from(response.headers.entries()), body: await response.json() })
        assert.deepEqual(route.effects, { views: 0, notifications: 0, analyticsReads: 0 })
      }
      assert.equal(outcomes[0].status, 404)
      assert.deepEqual(outcomes[0].body, { error: 'Profile not found' })
      assert.deepEqual(outcomes[0], outcomes[1])
      assert.deepEqual(outcomes[0], outcomes[2])
    }
  }
})

test('public profile owner and duplicate views retain tracking exclusions', async () => {
  for (const reason of ['own_profile', 'duplicate']) {
    const route = viewRoute(true, reason === 'own_profile' ? 'target-user' : null, reason === 'duplicate')
    const response = await route.handler(viewRequest())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { counted: false, reason })
    assert.equal(route.effects.views, 0)
    assert.equal(route.effects.notifications, 0)
  }
})

test('unsupported profile types cannot bypass visibility validation', async () => {
  const route = viewRoute(true)
  const response = await route.handler(viewRequest('anything'))
  assert.equal(response.status, 400)
  assert.deepEqual(route.effects, { views: 0, notifications: 0, analyticsReads: 0 })
})

test('engagement cron fails closed and accepts only the configured Bearer secret', async () => {
  const previous = process.env.CRON_SECRET
  try {
    const cases = [
      { configured: 'test-cron-token', headers: { authorization: 'Bearer test-cron-token' }, allowed: true },
      { configured: 'test-cron-token', headers: { authorization: 'Bearer wrong-token' }, allowed: false },
      { configured: 'test-cron-token', headers: {}, allowed: false },
      { configured: undefined, headers: { authorization: 'Bearer test-cron-token' }, allowed: false },
      { configured: '', headers: { authorization: 'Bearer ' }, allowed: false },
      { configured: '   ', headers: {}, allowed: false },
      { configured: 'test-cron-token', headers: { 'x-vercel-cron': '1' }, allowed: false },
      { configured: undefined, headers: { 'x-vercel-cron': '1' }, allowed: false },
      { configured: 'test-cron-token', headers: { authorization: 'Bearer wrong', 'x-vercel-cron': '1' }, allowed: false },
      { configured: 'test-cron-token', headers: { 'user-agent': 'vercel-cron/1.0' }, allowed: false }
    ]
    for (const entry of cases) {
      if (entry.configured === undefined) delete process.env.CRON_SECRET
      else process.env.CRON_SECRET = entry.configured
      let reads = 0
      const read = async () => { reads++; return [] }
      const rejectEffect = () => { throw new Error('Unexpected cron write/email') }
      const handler = loadRoute('app/api/cron/engagement-nudges/route.ts', {
        '@/lib/prisma': { prisma: { user: { findMany: read }, talentProfile: { findMany: read } } },
        '@/lib/email-lifecycle': { logEmailEvent: rejectEffect, shouldSendEmail: rejectEffect },
        '@/lib/email': {
          sendClubRecruitingNudgeEmail: rejectEffect, sendTalentInvitationReminderEmail: rejectEffect,
          sendIncompleteClubProfileEmail: rejectEffect
        },
        '@/lib/logger': { default: { error: rejectEffect } }
      }).GET
      const response = await handler(new Request('https://example.com/api/cron/engagement-nudges', {
        headers: entry.headers as Record<string, string>
      }))
      assert.equal(response.status, entry.allowed ? 200 : 401)
      assert.equal(reads, entry.allowed ? 3 : 0)
      assert.deepEqual(await response.json(), entry.allowed
        ? { success: true, clubSent: 0, talentSent: 0, incompleteClubsSent: 0 }
        : { message: 'Unauthorized' })
    }
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previous
  }
})
