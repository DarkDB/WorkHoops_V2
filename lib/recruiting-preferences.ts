export const COUNTRY_OPTIONS = [
  'Alemania', 'Argentina', 'Australia', 'Austria', 'Bélgica', 'Brasil', 'Canadá',
  'Chile', 'Colombia', 'Croacia', 'Dinamarca', 'España', 'Estados Unidos', 'Finlandia',
  'Francia', 'Grecia', 'Irlanda', 'Italia', 'Japón', 'Marruecos', 'México', 'Países Bajos',
  'Polonia', 'Portugal', 'Reino Unido', 'República Checa', 'Serbia', 'Suecia', 'Suiza',
  'Turquía', 'Uruguay'
] as const

export const EU_PASSPORT_OPTIONS = [
  { value: 'YES', label: 'Sí, tengo pasaporte de la UE' },
  { value: 'NO', label: 'No tengo pasaporte de la UE' },
  { value: 'NOT_PROVIDED', label: 'Prefiero no indicarlo' }
] as const

export const RELOCATION_PREFERENCE_OPTIONS = [
  { value: 'YES', label: 'Sí, puedo cambiar de ciudad o país' },
  { value: 'DOMESTIC_ONLY', label: 'Solo dentro de mi país' },
  { value: 'STUDIES_ONLY', label: 'Solo si es compatible con mis estudios' },
  { value: 'DEPENDS_ON_CONDITIONS', label: 'Depende de las condiciones' },
  { value: 'NO', label: 'No puedo cambiar de ubicación' },
  { value: 'NOT_PROVIDED', label: 'Prefiero no indicarlo' }
] as const

export const euPassportLabel = (value?: string | null) =>
  EU_PASSPORT_OPTIONS.find((option) => option.value === value)?.label ?? null

export const relocationPreferenceLabel = (value?: string | null) =>
  RELOCATION_PREFERENCE_OPTIONS.find((option) => option.value === value)?.label ?? null
