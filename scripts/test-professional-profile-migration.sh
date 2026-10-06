#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 22 ]] || { echo 'Use Node 22'; exit 1; }
container="workhoops-professional-profile-test-$$"
temporary="$(mktemp -d /tmp/workhoops-professional-test.XXXXXX)"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$temporary"
}
trap cleanup EXIT
# This harness is strictly local. Never read or reuse a repository .env.
docker run --detach --name "$container" --publish 127.0.0.1::5432 \
  --env POSTGRES_PASSWORD=local_test_only --env POSTGRES_DB=professional_profile_test \
  postgres:15-alpine >/dev/null
for ((attempt=0; attempt<60; attempt++)); do
  if docker exec "$container" pg_isready -U postgres -d professional_profile_test >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$container" pg_isready -U postgres -d professional_profile_test >/dev/null
port="$(docker port "$container" 5432/tcp | head -1 | cut -d: -f2)"
export DATABASE_URL="postgresql://postgres:local_test_only@127.0.0.1:${port}/professional_profile_test"
export PROFESSIONAL_PROFILE_TEST_DATABASE_URL="$DATABASE_URL"
docker exec -i "$container" psql -U postgres -d professional_profile_test -v ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
SQL
mkdir -p "$temporary/prisma/migrations"
git show HEAD:prisma/schema.prisma > "$temporary/prisma/schema.prisma"
cp prisma/migrations/migration_lock.toml "$temporary/prisma/migrations/"
cp -R prisma/migrations/0_production_baseline prisma/migrations/20260901_recruiting_basics_v1 "$temporary/prisma/migrations/"
node node_modules/prisma/build/index.js migrate deploy --schema "$temporary/prisma/schema.prisma"
docker exec -i "$container" psql -U postgres -d professional_profile_test -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO users (id, email, name, role, "updatedAt") VALUES ('00000000-0000-4000-8000-000000000001', 'historical@example.invalid', 'Historical', 'jugador', CURRENT_TIMESTAMP);
INSERT INTO talent_profiles (id, "userId", "fullName", role, city, country, position, height, bio, "lastTeam", "isPublic", verified, "profileCompletionPercentage", "availabilityStatus", "updatedAt")
VALUES ('historical-test-profile', '00000000-0000-4000-8000-000000000001', 'Historical', 'jugador', 'Paris', 'France', 'Escolta', 190, 'Legacy bio', 'Legacy team', false, false, 100, 'AVAILABLE', CURRENT_TIMESTAMP);
-- Emulate Supabase REST table grants, including grants on future tables.
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
-- Demonstrate the legacy authorization risk without keeping any changes.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
DO $$
DECLARE affected integer;
BEGIN
  UPDATE users SET role = 'admin' WHERE id = '00000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Expected legacy role escalation risk'; END IF;
  UPDATE talent_profiles SET verified = true WHERE id = 'historical-test-profile';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Expected legacy arbitrary own-column update'; END IF;
END $$;
ROLLBACK;
SQL
node node_modules/prisma/build/index.js migrate deploy
node node_modules/prisma/build/index.js migrate status
node node_modules/tsx/dist/cli.mjs --test tests/professional-profile.integration.test.ts
if [[ "${PROFESSIONAL_PROFILE_TEST_BUILD:-0}" == 1 ]]; then
  yarn build
fi
