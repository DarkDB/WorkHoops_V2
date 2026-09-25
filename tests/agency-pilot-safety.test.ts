import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  canContactTalent,
  isPublicPlayerProfile,
  selectPublicContactTarget,
  toPublicClubListItem
} from '../lib/agency-pilot-safety'

test('club listing keeps public card fields and strips private fields', () => {
  const row = {
    id: 'club-1',
    verified: true,
    email: 'private@example.com',
    clubAgencyProfile: {
      slug: 'crm-basketball',
      legalName: 'CRM Basketball Agency',
      commercialName: 'CRM Basketball',
      city: 'Madrid',
      logo: 'https://example.com/logo.png',
      fiscalDocument: 'private-document',
      contactPhone: 'private-phone'
    },
    opportunities: [{ id: 'offer-1' }]
  }
  const item = toPublicClubListItem(row)

  assert.deepEqual(item, {
    id: 'club-1',
    name: 'CRM Basketball',
    verified: true,
    profile: {
      slug: 'crm-basketball',
      city: 'Madrid',
      logo: 'https://example.com/logo.png'
    },
    opportunitiesCount: 1
  })
  assert.equal(JSON.stringify(item).includes('private'), false)
})

test('only recruiting roles can contact talent', () => {
  assert.equal(canContactTalent('club'), true)
  assert.equal(canContactTalent('agencia'), true)
  assert.equal(canContactTalent('admin'), true)
  assert.equal(canContactTalent('jugador'), false)
  assert.equal(canContactTalent('entrenador'), false)
  assert.equal(canContactTalent(undefined), false)
})

test('contact target accepts public players and coaches, but not private profiles', () => {
  const publicPlayer = { fullName: 'Player', isPublic: true, user: { id: 'user-1', email: 'player@example.com', name: null } }
  const publicCoach = { fullName: 'Coach', isPublic: true, user: { id: 'user-2', email: 'coach@example.com', name: null } }

  assert.deepEqual(selectPublicContactTarget(publicPlayer, null, 'user-1'), { kind: 'player', profile: publicPlayer })
  assert.deepEqual(selectPublicContactTarget(null, publicCoach, 'user-2'), { kind: 'coach', profile: publicCoach })
  assert.equal(selectPublicContactTarget({ ...publicPlayer, isPublic: false }, null, 'user-1'), null)
  assert.equal(selectPublicContactTarget(null, { ...publicCoach, isPublic: false }, 'user-2'), null)
  assert.equal(selectPublicContactTarget(null, { ...publicCoach, isPublic: null }, 'user-2'), null)
  assert.equal(selectPublicContactTarget(publicPlayer, null, 'wrong-user'), null)
})

test('shortlist and invitations accept only public players', () => {
  assert.equal(isPublicPlayerProfile({ role: 'jugador', isPublic: true }), true)
  assert.equal(isPublicPlayerProfile({ role: 'jugador', isPublic: false }), false)
  assert.equal(isPublicPlayerProfile({ role: 'entrenador', isPublic: true }), false)
  assert.equal(isPublicPlayerProfile(null), false)
})
