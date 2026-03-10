export type AppRole = 'admin' | 'jugador' | 'entrenador' | 'club' | 'agencia'

export type EntitlementTier =
  | 'player_free'
  | 'player_premium'
  | 'club_free_trial'
  | 'club_pro_premium'
  | 'admin'

type PlanInfo = {
  label: string
  priceLabel: string
}

const PLAN_INFO: Record<string, PlanInfo> = {
  free_amateur: { label: 'Jugador Free', priceLabel: 'Gratis' },
  pro_semipro: { label: 'Jugador Premium', priceLabel: '4,99€/mes' },
  club_trial: { label: 'Club Trial', priceLabel: 'Gratis' },
  club_agencia: { label: 'Club Trial', priceLabel: 'Gratis' },
  club_pro: { label: 'Club Pro', priceLabel: '29,90€/mes' },
  destacado: { label: 'Destacado', priceLabel: '49,90€ / 60 días' },
  gratis: { label: 'Free', priceLabel: 'Gratis' },
  free: { label: 'Free', priceLabel: 'Gratis' }
}

const PLAYER_PREMIUM_PLANS = new Set(['pro_semipro'])
const CLUB_PRO_PLANS = new Set(['club_pro', 'destacado'])
const CLUB_TRIAL_PLANS = new Set(['club_trial', 'club_agencia', 'free_amateur', 'gratis', 'free'])

export function normalizePlanType(inputPlanType: string | null | undefined, role?: string | null): string {
  if (role === 'club' || role === 'agencia') {
    if (inputPlanType && (CLUB_TRIAL_PLANS.has(inputPlanType) || CLUB_PRO_PLANS.has(inputPlanType))) {
      return inputPlanType
    }
    return 'club_trial'
  }

  if (inputPlanType && (PLAYER_PREMIUM_PLANS.has(inputPlanType) || inputPlanType === 'free_amateur' || inputPlanType === 'gratis' || inputPlanType === 'free')) {
    return inputPlanType
  }

  return 'free_amateur'
}

export function getPlanLabel(planType: string | null | undefined): string {
  if (!planType) return 'Sin plan'
  return PLAN_INFO[planType]?.label || planType
}

export function getPlanPriceLabel(planType: string | null | undefined): string {
  if (!planType) return 'Gratis'
  return PLAN_INFO[planType]?.priceLabel || 'Gratis'
}

export function resolveEntitlements(role: string | null | undefined, planType: string | null | undefined) {
  const normalizedRole = (role || 'jugador') as AppRole
  const normalizedPlan = normalizePlanType(planType, normalizedRole)

  if (normalizedRole === 'admin') {
    return {
      role: normalizedRole,
      planType: normalizedPlan,
      tier: 'admin' as EntitlementTier,
      canPublishOpportunities: true,
      maxActiveOpportunities: 999,
      canShortlistTalents: true,
      canInviteTalents: true,
      requiresOpportunityReview: false
    }
  }

  if (normalizedRole === 'club' || normalizedRole === 'agencia') {
    const isPro = CLUB_PRO_PLANS.has(normalizedPlan)
    return {
      role: normalizedRole,
      planType: normalizedPlan,
      tier: (isPro ? 'club_pro_premium' : 'club_free_trial') as EntitlementTier,
      canPublishOpportunities: true,
      maxActiveOpportunities: isPro ? 20 : 5,
      canShortlistTalents: true,
      canInviteTalents: true,
      requiresOpportunityReview: false
    }
  }

  const isPremiumPlayer = PLAYER_PREMIUM_PLANS.has(normalizedPlan)
  return {
    role: normalizedRole,
    planType: normalizedPlan,
    tier: (isPremiumPlayer ? 'player_premium' : 'player_free') as EntitlementTier,
    canPublishOpportunities: false,
    maxActiveOpportunities: 0,
    canShortlistTalents: false,
    canInviteTalents: false,
    requiresOpportunityReview: false
  }
}
