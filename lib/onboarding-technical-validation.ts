import { PHYSICAL_LIMITS } from './physical-validations'

export const WINGSPAN_FORMAT_ERROR = 'Introduce la envergadura en centímetros, por ejemplo 190'

export type TechnicalField = 'fullName' | 'city' | 'position' | 'height' | 'weight' | 'wingspan'
export type TechnicalErrors = Partial<Record<TechnicalField, string>>

type TechnicalValues = Record<TechnicalField, string | number | null | undefined>

export function parseWingspanCm(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const text = String(value).trim()
  if (!/^\d+(?:\.\d+)?$/.test(text)) throw new Error(WINGSPAN_FORMAT_ERROR)
  const centimeters = Number(text)
  if (centimeters < PHYSICAL_LIMITS.wingspan.min || centimeters > PHYSICAL_LIMITS.wingspan.max) {
    throw new Error(WINGSPAN_FORMAT_ERROR)
  }
  return centimeters
}

export function getTechnicalStepErrors(values: TechnicalValues): TechnicalErrors {
  const errors: TechnicalErrors = {}
  if (!String(values.fullName ?? '').trim()) errors.fullName = 'Introduce tu nombre completo'
  if (!String(values.city ?? '').trim()) errors.city = 'Introduce tu ciudad'
  if (!String(values.position ?? '').trim()) errors.position = 'Selecciona tu posición principal'

  const height = Number(values.height)
  if (values.height === '' || values.height === null || values.height === undefined) {
    errors.height = 'Introduce tu altura en centímetros'
  } else if (!Number.isFinite(height) || height < PHYSICAL_LIMITS.height.min || height > PHYSICAL_LIMITS.height.max) {
    errors.height = `La altura debe estar entre ${PHYSICAL_LIMITS.height.min} y ${PHYSICAL_LIMITS.height.max} cm`
  }

  if (values.weight !== '' && values.weight !== null && values.weight !== undefined) {
    const weight = Number(values.weight)
    if (!Number.isFinite(weight) || weight < PHYSICAL_LIMITS.weight.min || weight > PHYSICAL_LIMITS.weight.max) {
      errors.weight = `El peso debe estar entre ${PHYSICAL_LIMITS.weight.min} y ${PHYSICAL_LIMITS.weight.max} kg`
    }
  }

  try {
    parseWingspanCm(values.wingspan)
  } catch {
    errors.wingspan = WINGSPAN_FORMAT_ERROR
  }
  return errors
}
