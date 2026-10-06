# Professional Profile v1 - backend only

## Scope

This phase adds player career entries and professional/evidence statuses. No UI,
coach career model, matching, pricing, publication changes or automatic backfill.
`verified` and scouting readiness have separate meanings. Readiness means sufficient
information for an initial review, not professional ability or verified claims.

## Endpoints

All writes require the existing NextAuth session. Only `jugador` owners and `admin`
may use the professional endpoints; `club`, `agencia` and `entrenador` are denied.
Admins may specify `?profileId=...` for another player. Other players receive 404.
The shared handler reloads the actor's current role/active flag from `users`; an
old JWT admin role or a deactivated/deleted account cannot authorize evidence review.
All professional API responses use `Cache-Control: private, no-store`.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/talent/career` | GET, POST | Owner list / create entry |
| `/api/talent/career/[entryId]` | PATCH, DELETE | Owner/admin update / delete |
| `/api/talent/professional-profile` | GET, PATCH | Contract and representation |
| `/api/admin/talent/[profileId]/evidence` | PATCH | Admin-only evidence review |

Career create requires `season` and `clubName`. The other requested career/statistics
fields are optional. Multiple clubs in the same season are permitted. There is no
relationship to a WorkHoops club account. Unknown write fields, including evidence
flags, publication and verification flags, are rejected.

A professional PATCH can contain `contractStatus`, nullable ISO datetime
`contractUntil`, `representationStatus`, nullable `representativeName`. Dates outside
`UNDER_CONTRACT` and names outside `REPRESENTED` are cleared. For example:

```json
{"contractStatus":"FREE_AGENT","representationStatus":"UNREPRESENTED"}
```

Admin review accepts `kind` (`experience`, `stats`, `passport`, `video`, `fullGame`),
`status` (`DECLARED`, `CONTRASTED`) and `careerEntryId` only for the first two kinds.
The reviewer ID comes from the session, never from a client payload. No reviewer
role exists in the current role model, so this phase authorizes admins only.
`CONTRASTED` is an explicit human review action, not an automatic check.
Empty statistics, absent video and uninformed passport status cannot be contrasted.

## Evidence invalidation

Experience changes invalidate only experience review; statistics changes invalidate
only statistics review. No-op edits preserve evidence. Changes to passport status,
highlights or full-game URL in either existing player write API reset the respective
status and clear review date/reviewer. The new nullable profile review date/ID fields
are necessary to keep provenance for those three statuses, analogous to career data.

Updates compare the loaded record/evidence snapshot, not only `updatedAt` (whose
precision is milliseconds). Concurrent changes return 409 rather than saving against
a stale review, including same-timestamp changes. Existing player write APIs use the
same evidence guard to avoid retaining a concurrently added review.
No publication, completion, availability-confirmation or global verification flags
are modified by the new professional endpoints.

## Public boundary

The existing public player DTO includes contract status, conditional contract end,
representation status, career descriptions/statistics, evidence statuses and computed
readiness. It excludes representative names, reviewer IDs/dates, internal career IDs,
user IDs, emails and technical timestamps. Private players still return no public DTO.
Recommended information does not block readiness. Missing passport is not interpreted
as NO; passport NO is informed information and does not itself prevent readiness.

RLS is enabled on the career table. The new migration adds restrictive deny-all
policies for Supabase roles `anon` and `authenticated` on `talent_profiles`,
`talent_career_entries`, `users`, `accounts`, `sessions`, `verification_tokens` and
`otp_tokens`. RLS is explicitly enabled on these tables; the baseline had OTP RLS
disabled. These guards AND with legacy permissive policies and prevent SELECT,
INSERT, UPDATE and DELETE even if Supabase grants full table/column access.
`users` and authentication material must be protected too: otherwise a REST client
could alter roles or forge identity and subsequently use the admin review endpoint.
Historical policies/grants are not deleted and historical migrations stay untouched.

Owners/admins access these tables through NextAuth + Prisma server endpoints only.
No current application consumer uses REST for these tables; the Supabase integration
found in code uses Storage only. RLS is deliberately not forced on the owner: Prisma
must run with the trusted database owner/BYPASSRLS role, not `anon`/`authenticated`.
Supabase `service_role` also bypasses RLS and must remain server-only. Client requests
with a Supabase admin JWT mapped to `authenticated` are intentionally still denied;
only the current NextAuth/admin role through our server is authorized.

No Production schema exposure settings, grants, views or RPCs were queried. Public
schema tables are potential PostgREST resources if that schema is exposed. There are
no views/security-definer RPCs in the versioned migrations, but any out-of-repository
owner-rights view/RPC would need a separate read-only rollout audit. Row-level policies
do not hide column definitions; the guards ensure they return no actual private data.

Professional field policy: public DTO includes contract/representation statuses and
contract end only for UNDER_CONTRACT on a public profile. Authenticated clubs/agencies
receive the same deliberate public information, no additional private fields. Owner
and admin may access representativeName and review provenance. These are excluded
from public DTO/HTML. Existing `/talento/perfiles/[id]` and `/jugador/[slug]` server
pages still enforce publication and render their existing fields only; they do not
serialize the new private fields. Legacy contact/view user-ID props remain unchanged.

## Migration / rollout

Order:

1. `0_production_baseline`
2. `20260901_recruiting_basics_v1`
3. `20261006_professional_profile_v1`

The new migration creates three enums, adds nullable/defaulted profile columns and
creates the career table/indexes/cascade FK/RLS. It does not update/delete existing
rows or infer career entries from `bio` / `lastTeam`. Do not execute the existing
baseline SQL against Production. Do not deploy the new Prisma client until the new
migration has been separately reviewed and applied; it selects the new fields.
Nothing has been applied to Production in this implementation task.
Schema/data changes are additive; REST access is intentionally tightened by the new
policies. Review that permission change before rollout. No UI or auth/login logic
is changed. The migration runs in a transaction so columns and REST guards become
visible together. Before deploying, confirm the trusted Prisma role and absence of alternate
REST views/RPCs exposing these tables; do not grant browser clients a service key.

## Local validation

Use Node 22 and the existing Yarn lockfile. The disposable harness requires Docker
with `postgres:15-alpine`, runs only on 127.0.0.1, prepares Supabase auth primitives,
applies baseline + Recruiting, creates a synthetic historical profile, simulates
Supabase full table/default grants and proves the legacy role/evidence risks in a
rolled-back transaction. It applies the new migration and tests actual CRUD, column
reads, forged evidence/identity, own/foreign row writes, future permissive policies,
same-timestamp races, cascade and owner-server access. It removes its own container
and temporary directory on exit. It never loads a repository `.env` or Production URL.

```sh
npx --yes --package=node@22 --call 'bash scripts/test-professional-profile-migration.sh'
npx --yes --package=node@22 -- node node_modules/tsx/dist/cli.mjs --test tests/*.test.ts
```

Integration tests are skipped outside that explicitly isolated harness. Unit and
existing route tests run without database/auth/email services. No external emails,
Production calls or historical backfill occur.
