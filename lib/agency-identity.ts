export const REGISTRATION_ROLES = ['jugador', 'entrenador', 'club', 'agencia'] as const

export function getRegistrationRole(value: string) {
  return REGISTRATION_ROLES.find((role) => role === value) || null
}

export function getRegistrationPayload(name: string, email: string, password: string, role: typeof REGISTRATION_ROLES[number]) {
  return { name, email, password, role, planType: 'free_amateur' }
}

export function getProfileEntityType(role: string, requested: string) {
  return role === 'agencia' ? 'agencia' : requested
}

export function resolveProfileVisibility(
  role: string,
  requested: boolean | undefined,
  existing: boolean | undefined
) {
  if (requested !== undefined) return requested
  if (existing !== undefined) return existing
  return role !== 'agencia'
}

export function getPublicEntityCopy(entityType: string) {
  if (entityType === 'agencia') {
    return {
      label: 'Agencia',
      about: 'Sobre la agencia',
      searchCta: 'Buscar talento',
      interestCta: null,
      emptyOpportunities: 'Esta agencia no tiene ofertas activas en este momento.',
      metaTitle: 'Agencia en WorkHoops'
    }
  }

  return {
    label: 'Club',
    about: 'Sobre el club',
    searchCta: 'Buscar jugadores',
    interestCta: 'Quiero jugar en este club',
    emptyOpportunities: 'Este club no tiene ofertas activas en este momento.',
    metaTitle: 'Club en WorkHoops'
  }
}

export function canReceiveClubInterest(role: string, entityType: string, isPublic: boolean) {
  return role === 'club' && entityType !== 'agencia' && isPublic
}
