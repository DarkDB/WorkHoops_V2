import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getProfileEntityType,
  canReceiveClubInterest,
  getPublicEntityCopy,
  getRegistrationPayload,
  getRegistrationRole,
  resolveProfileVisibility
} from '../lib/agency-identity'

test('registration keeps agency and club roles distinct, including URL role selection', () => {
  assert.equal(getRegistrationRole('agencia'), 'agencia')
  assert.equal(getRegistrationRole('club'), 'club')
  assert.equal(getRegistrationRole('invalid'), null)
  assert.equal(getRegistrationPayload('CRM', 'crm@example.com', 'Password1', 'agencia').role, 'agencia')
  assert.equal(getRegistrationPayload('Club', 'club@example.com', 'Password1', 'club').role, 'club')
})

test('agency onboarding uses agency entity type and starts private', () => {
  assert.equal(getProfileEntityType('agencia', 'club'), 'agencia')
  assert.equal(getProfileEntityType('club', 'club'), 'club')
  assert.equal(resolveProfileVisibility('agencia', undefined, undefined), false)
  assert.equal(resolveProfileVisibility('club', undefined, undefined), true)
})

test('editing preserves privacy unless publication is explicitly changed', () => {
  assert.equal(resolveProfileVisibility('agencia', undefined, false), false)
  assert.equal(resolveProfileVisibility('agencia', undefined, true), true)
  assert.equal(resolveProfileVisibility('agencia', true, false), true)
  assert.equal(resolveProfileVisibility('club', undefined, false), false)
})

test('agency public copy avoids club-only claims while club copy remains unchanged', () => {
  const agency = getPublicEntityCopy('agencia')
  assert.equal(agency.label, 'Agencia')
  assert.equal(agency.about, 'Sobre la agencia')
  assert.equal(agency.searchCta, 'Buscar talento')
  assert.equal(agency.interestCta, null)
  assert.equal(JSON.stringify(agency).includes('Sobre el club'), false)
  assert.equal(JSON.stringify(agency).includes('Quiero jugar en este club'), false)

  const club = getPublicEntityCopy('club')
  assert.equal(club.about, 'Sobre el club')
  assert.equal(club.searchCta, 'Buscar jugadores')
  assert.equal(club.interestCta, 'Quiero jugar en este club')
})

test('club interest rejects agencies and private club pages', () => {
  assert.equal(canReceiveClubInterest('club', 'club', true), true)
  assert.equal(canReceiveClubInterest('club', 'club', false), false)
  assert.equal(canReceiveClubInterest('agencia', 'agencia', true), false)
  assert.equal(canReceiveClubInterest('club', 'agencia', true), false)
})
