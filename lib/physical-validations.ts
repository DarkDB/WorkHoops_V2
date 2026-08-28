export const PHYSICAL_LIMITS = {
  height: { min: 140, max: 240 },
  weight: { min: 40, max: 180 },
  wingspan: { min: 140, max: 260 },
  age: { min: 12, max: 60 },
} as const

export function normalizeOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function validateNumberRange(
  value: number | null,
  min: number,
  max: number,
  label: string
) {
  if (value === null) return
  if (value < min || value > max) {
    throw new Error(`${label} debe estar entre ${min} y ${max}`)
  }
}
