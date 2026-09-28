import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getTechnicalStepErrors, parseWingspanCm, WINGSPAN_FORMAT_ERROR } from '../lib/onboarding-technical-validation'

const reportedValues = {
  fullName: 'Jugador de prueba', city: 'Madrid', position: 'Pívot', height: '190',
  weight: '88', wingspan: '1’90'
}

test('reported wingspan format shows an actionable error, not a silent block', () => {
  assert.equal(getTechnicalStepErrors(reportedValues).wingspan, WINGSPAN_FORMAT_ERROR)
  assert.throws(() => parseWingspanCm('1’90'), { message: WINGSPAN_FORMAT_ERROR })
})

test('wingspan accepts centimeters and rejects ambiguous meter formats', () => {
  assert.equal(parseWingspanCm('190'), 190)
  assert.equal(parseWingspanCm('190.5'), 190.5)
  assert.equal(parseWingspanCm(''), null)
  for (const value of ['1.90', '1,90', '1’90']) {
    assert.throws(() => parseWingspanCm(value), { message: WINGSPAN_FORMAT_ERROR })
  }
})

test('last team is optional; required fields report individual errors', () => {
  assert.deepEqual(getTechnicalStepErrors({ ...reportedValues, wingspan: '190' }), {})
  const errors = getTechnicalStepErrors({ ...reportedValues, fullName: ' ', city: '', position: '', height: '' })
  assert.deepEqual(Object.keys(errors), ['fullName', 'city', 'position', 'height', 'wingspan'])
})
