import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { resolveEntitlements } from '@/lib/entitlements'

// ========== TYPES ==========

interface SessionUser {
  id: string
  role?: string
  planType?: string
  email?: string
  name?: string
}

interface OpportunityForAccess {
  authorId: string
  organization?: {
    ownerId: string
  } | null
}

interface ApplicationForAccess {
  userId: string
  opportunity: {
    organization?: {
      ownerId: string
    } | null
  }
}

// ========== SESSION HELPERS ==========

/**
 * Verify session exists
 * @returns NextResponse 401 if no session, null if OK
 */
export function requireSession(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return null
}

/**
 * Get user ID safely
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null
}

/**
 * Get user role safely
 */
export function getUserRole(session: Session | null): string | null {
  return (session?.user as SessionUser)?.role || null
}

// ========== ROLE HELPERS ==========

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  const role = getUserRole(session)
  return role === 'admin'
}

/**
 * Check if user is club or agency
 */
export function isClubOrAgency(session: Session | null): boolean {
  const role = getUserRole(session)
  return role === 'club' || role === 'agencia'
}

/**
 * Check if user has premium plan
 */
export function isPremiumUser(session: Session | null): boolean {
  const role = (session?.user as SessionUser)?.role
  const planType = (session?.user as SessionUser)?.planType
  const entitlements = resolveEntitlements(role, planType)
  return entitlements.tier === 'player_premium' || entitlements.tier === 'club_pro_premium'
}

// ========== OPPORTUNITY PERMISSION HELPERS ==========

/**
 * Check if user can manage (edit/delete) an opportunity
 * Rules:
 * - Admin: always can
 * - Author: always can
 * - Organization owner: can if organization exists
 */
export function canManageOpportunity(
  session: Session | null,
  opportunity: OpportunityForAccess
): boolean {
  if (!session?.user?.id) return false
  
  const userId = session.user.id
  
  // Admin can do everything
  if (isAdmin(session)) return true
  
  // Author can manage
  if (opportunity.authorId === userId) return true
  
  // Organization owner can manage (if organization exists)
  if (opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verify and return error if cannot manage
 * @returns NextResponse 403 if no permission, null if OK
 */
export function requireManageOpportunity(
  session: Session | null,
  opportunity: OpportunityForAccess
): NextResponse | null {
  if (!canManageOpportunity(session, opportunity)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

// ========== APPLICATION PERMISSION HELPERS ==========

/**
 * Check if user can view an application
 * Rules:
 * - Admin: always can
 * - Applicant (userId): can view own application
 * - Organization owner of the opportunity: can view
 */
export function canViewApplication(
  session: Session | null,
  application: ApplicationForAccess
): boolean {
  if (!session?.user?.id) return false
  
  const userId = session.user.id
  
  // Admin can do everything
  if (isAdmin(session)) return true
  
  // Applicant can view own application
  if (application.userId === userId) return true
  
  // Organization owner can view (if organization exists)
  if (application.opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verify and return error if cannot view
 */
export function requireViewApplication(
  session: Session | null,
  application: ApplicationForAccess
): NextResponse | null {
  if (!canViewApplication(session, application)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Check if user can update application state
 * Rules:
 * - Admin: always can
 * - Organization owner of the opportunity: can update
 * - Applicant: CANNOT update state (only employer/admin can)
 */
export function canUpdateApplicationState(
  session: Session | null,
  application: ApplicationForAccess
): boolean {
  if (!session?.user?.id) return false
  
  // Admin can do everything
  if (isAdmin(session)) return true
  
  // Only organization owner can update state
  const userId = session.user.id
  if (application.opportunity.organization?.ownerId === userId) return true
  
  return false
}

/**
 * Verify and return error if cannot update state
 */
export function requireUpdateApplicationState(
  session: Session | null,
  application: ApplicationForAccess
): NextResponse | null {
  if (!canUpdateApplicationState(session, application)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

// ========== ADMIN HELPER ==========

/**
 * Verify user is admin
 * @returns NextResponse 403 if not admin, null if OK
 */
export function requireAdmin(session: Session | null): NextResponse | null {
  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Combine requireSession + requireAdmin
 */
export function requireAdminSession(session: Session | null): NextResponse | null {
  const sessionError = requireSession(session)
  if (sessionError) return sessionError
  
  const adminError = requireAdmin(session)
  if (adminError) return adminError
  
  return null
}
