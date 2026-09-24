-- Recruiting Basics v1: optional player preferences for club recruiting.
CREATE TYPE "EuPassportStatus" AS ENUM ('YES', 'NO', 'NOT_PROVIDED');

CREATE TYPE "RelocationPreference" AS ENUM (
  'YES',
  'DOMESTIC_ONLY',
  'STUDIES_ONLY',
  'DEPENDS_ON_CONDITIONS',
  'NO',
  'NOT_PROVIDED'
);

ALTER TABLE "talent_profiles"
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "euPassportStatus" "EuPassportStatus" NOT NULL DEFAULT 'NOT_PROVIDED',
  ADD COLUMN "targetCountries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "relocationPreference" "RelocationPreference" NOT NULL DEFAULT 'NOT_PROVIDED',
  ADD COLUMN "isStudent" BOOLEAN,
  ADD COLUMN "availabilityConfirmedAt" TIMESTAMP(3);
