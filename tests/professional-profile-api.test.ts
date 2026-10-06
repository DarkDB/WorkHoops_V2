import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'
import { ProfessionalProfileError } from '../lib/professional-profile-service'
import { z } from 'zod'

function api(session: object | null, currentUser: object | null = { id: 'trusted', role: 'jugador', isActive: true }) {
  const source = readFileSync('lib/professional-profile-api.ts', 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const require = createRequire(import.meta.url)
  const module = { exports: {} as { professionalRequest: (action: (actor: { id: string; role: string }) => Promise<unknown>, status?: number) => Promise<Response> } }
  const mocks: Record<string, unknown> = {
    'next-auth': { getServerSession: async () => session },
    './auth': { authOptions: {} }, './prisma': { prisma: { user: { findUnique: async () => currentUser } } },
    './professional-profile-service': { createProfessionalProfileService: () => ({}), ProfessionalProfileError }
  }
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    if (name in mocks) return mocks[name]
    if (name.startsWith('./')) throw new Error('Unexpected dependency')
    return require(name)
  }, module, module.exports)
  return module.exports.professionalRequest
}

test('professional HTTP wrapper denies anonymous requests without invoking any operation', async () => {
  let actions = 0
  const response = await api(null)(async () => { actions++; return {} })
  assert.equal(response.status, 401)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(actions, 0)
})

test('professional HTTP wrapper passes trusted actor and preserves safe authorization errors', async () => {
  const request = api({ user: { id: 'trusted', role: 'jugador' } })
  const success = await request(async actor => { assert.deepEqual(actor, { id: 'trusted', role: 'jugador' }); return { success: true } }, 201)
  assert.equal(success.status, 201)
  assert.equal(success.headers.get('cache-control'), 'private, no-store')
  for (const status of [403, 404, 409]) {
    const response = await request(async () => { throw new ProfessionalProfileError(status, 'No disponible') })
    assert.equal(response.status, status)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    assert.deepEqual(await response.json(), { error: 'No disponible' })
  }
})

test('professional HTTP wrapper handles invalid JSON/input without leaking internals', async () => {
  const request = api({ user: { id: 'trusted', role: 'jugador' } })
  assert.equal((await request(async () => { throw new SyntaxError('bad JSON') })).status, 400)
  assert.equal((await request(async () => z.object({ clubName: z.string() }).parse({})) ).status, 400)
  const response = await request(async () => { throw new Error('private database details') })
  assert.equal(response.status, 500)
  assert.equal(JSON.stringify(await response.json()).includes('private database'), false)
})

test('professional HTTP wrapper rechecks current role and denies inactive/deleted accounts', async () => {
  const session = { user: { id: 'trusted', role: 'admin' } }
  let actions = 0
  const response = await api(session)(async actor => {
    actions++
    assert.equal(actor.role, 'jugador')
    throw new ProfessionalProfileError(403, 'No autorizado')
  })
  assert.equal(response.status, 403)
  assert.equal(actions, 1)
  for (const row of [null, { id: 'trusted', role: 'admin', isActive: false }]) {
    const denied = await api(session, row)(async () => { throw new Error('Must not run') })
    assert.equal(denied.status, 403)
  }
  assert.equal((await api(session, { id: 'trusted', role: 'admin', isActive: true })(async actor => {
    assert.equal(actor.role, 'admin')
    return { success: true }
  })).status, 200)
})
