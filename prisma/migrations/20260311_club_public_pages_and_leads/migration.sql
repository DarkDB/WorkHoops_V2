-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ClubLeadStatus') THEN
    CREATE TYPE "ClubLeadStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'REJECTED');
  END IF;
END
$$;

-- AlterTable: club_agency_profiles add stable public slug
ALTER TABLE "club_agency_profiles"
ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill slug for existing rows where missing
WITH normalized AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(COALESCE(NULLIF(legal_name, ''), 'club')), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'club'
    ) AS base_slug
  FROM "club_agency_profiles"
),
ranked AS (
  SELECT
    id,
    base_slug,
    ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS rn
  FROM normalized
)
UPDATE "club_agency_profiles" p
SET "slug" = CASE
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || '-' || r.rn::text
END
FROM ranked r
WHERE p.id = r.id
  AND p."slug" IS NULL;

-- Enforce uniqueness for public slug
CREATE UNIQUE INDEX IF NOT EXISTS "club_agency_profiles_slug_key"
ON "club_agency_profiles"("slug");

-- CreateTable: club leads from public club pages
CREATE TABLE IF NOT EXISTS "club_leads" (
  "id" TEXT NOT NULL,
  "clubUserId" TEXT NOT NULL,
  "clubProfileId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "age" INTEGER,
  "position" TEXT,
  "height" INTEGER,
  "city" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT,
  "status" "ClubLeadStatus" NOT NULL DEFAULT 'NEW',
  "sourceUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "club_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "club_leads_clubUserId_createdAt_idx"
ON "club_leads"("clubUserId", "createdAt");

CREATE INDEX IF NOT EXISTS "club_leads_clubProfileId_status_idx"
ON "club_leads"("clubProfileId", "status");

CREATE INDEX IF NOT EXISTS "club_leads_sourceUserId_createdAt_idx"
ON "club_leads"("sourceUserId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'club_leads_clubUserId_fkey'
  ) THEN
    ALTER TABLE "club_leads"
    ADD CONSTRAINT "club_leads_clubUserId_fkey"
    FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'club_leads_clubProfileId_fkey'
  ) THEN
    ALTER TABLE "club_leads"
    ADD CONSTRAINT "club_leads_clubProfileId_fkey"
    FOREIGN KEY ("clubProfileId") REFERENCES "club_agency_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'club_leads_sourceUserId_fkey'
  ) THEN
    ALTER TABLE "club_leads"
    ADD CONSTRAINT "club_leads_sourceUserId_fkey"
    FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
