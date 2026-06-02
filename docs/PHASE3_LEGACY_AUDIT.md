# Phase 3 Legacy / Ambiguity Audit

## Context
WorkHoops is now optimized around:
- Demand side: `club` / `agencia`
- Supply side: `jugador`
- Core loop: discovery -> shortlist -> contact/invite -> conversion

## Legacy / ambiguous areas detected

1. Parallel backend tree (`/backend`, Python artifacts)
- The Next.js app already contains production APIs under `/app/api`.
- The `backend/` folder and related test scripts look like a parallel stack and can confuse ownership/deploy.
- Recommendation:
  - P0: freeze new work there.
  - P1: move to `/legacy/backend-archive` or remove after backup.

2. Deprecated premium-contact flow (`/api/talent/notify-interest`)
- Current product strategy allows direct club-to-player contact without player premium gating.
- `notify-interest` is now non-core and can create UX contradictions.
- Recommendation:
  - P1: hide from UI (already done in practice).
  - P2: deprecate endpoint and remove once no clients depend on it.

3. Plan naming drift across code
- Historical names (`free`, `gratis`, `club_agencia`, `destacado`) co-exist with new tiers.
- Recommendation:
  - P0: keep `lib/entitlements.ts` as the only source of truth.
  - P1: migrate old labels progressively in admin views and marketing pages.

4. Hardcoded product metrics/claims in multiple pages
- Several pages still use static stats that may diverge from real product state.
- Recommendation:
  - P1: either replace with neutral copy or wire to real counters.
  - P2: centralize claims in a single config/content source.

5. Opportunity flow has legacy “review-first” assumptions
- Core API now publishes directly for club flows.
- Recommendation:
  - P1: add lightweight risk flags instead of blocking review queue (e.g., duplicate, suspicious links).

## What should be isolated next
- `/backend/**` and Python test harness files not used in Vercel deploy.
- Deprecated premium-contact routes and UI remnants.
- Any plan/pricing strings outside `lib/entitlements.ts` and `lib/stripe.ts`.
