-- Commit new columns and their REST guards together, never expose a partial rollout.
BEGIN;

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('NOT_PROVIDED', 'FREE_AGENT', 'UNDER_CONTRACT');

-- CreateEnum
CREATE TYPE "RepresentationStatus" AS ENUM ('NOT_PROVIDED', 'UNREPRESENTED', 'REPRESENTED');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('DECLARED', 'CONTRASTED');

-- AlterTable
ALTER TABLE "talent_profiles" ADD COLUMN     "contractStatus" "ContractStatus" NOT NULL DEFAULT 'NOT_PROVIDED',
ADD COLUMN     "contractUntil" TIMESTAMP(3),
ADD COLUMN     "fullGameEvidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'DECLARED',
ADD COLUMN     "fullGameVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "fullGameVerifiedById" TEXT,
ADD COLUMN     "passportEvidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'DECLARED',
ADD COLUMN     "passportVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "passportVerifiedById" TEXT,
ADD COLUMN     "representationStatus" "RepresentationStatus" NOT NULL DEFAULT 'NOT_PROVIDED',
ADD COLUMN     "representativeName" TEXT,
ADD COLUMN     "videoEvidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'DECLARED',
ADD COLUMN     "videoVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "videoVerifiedById" TEXT;

-- CreateTable
CREATE TABLE "talent_career_entries" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "country" TEXT,
    "competition" TEXT,
    "roleDescription" TEXT,
    "notes" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "gamesPlayed" INTEGER,
    "minutesPerGame" DOUBLE PRECISION,
    "pointsPerGame" DOUBLE PRECISION,
    "reboundsPerGame" DOUBLE PRECISION,
    "assistsPerGame" DOUBLE PRECISION,
    "experienceEvidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'DECLARED',
    "statsEvidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'DECLARED',
    "experienceVerifiedAt" TIMESTAMP(3),
    "statsVerifiedAt" TIMESTAMP(3),
    "experienceVerifiedById" TEXT,
    "statsVerifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_career_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "talent_career_entries_talentProfileId_idx" ON "talent_career_entries"("talentProfileId");

-- CreateIndex
CREATE INDEX "talent_career_entries_season_idx" ON "talent_career_entries"("season");

-- AddForeignKey
ALTER TABLE "talent_career_entries" ADD CONSTRAINT "talent_career_entries_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Direct Supabase REST clients cannot read/write career entries. Access is mediated
-- by authenticated server endpoints and the explicit public profile DTO.
ALTER TABLE "talent_career_entries" ENABLE ROW LEVEL SECURITY;

-- NextAuth identities and UserRole permissions are enforced by the server APIs,
-- not Supabase JWT roles. Restrictive policies AND with all permissive policies,
-- so legacy/public policies and automatic table/column grants cannot bypass them.
-- Do not FORCE RLS: the trusted server database owner must retain Prisma access.
ALTER TABLE public."talent_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_profiles_server_api_only"
ON public."talent_profiles" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "talent_career_entries_server_api_only"
ON public."talent_career_entries" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- users is the authorization source. Direct REST must not expose password hashes
-- or let clients promote themselves to admin and then contrast evidence via API.
CREATE POLICY "users_server_api_only"
ON public."users" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

-- Protect the authentication material that establishes the trusted admin identity.
-- A REST client must not forge OTPs/accounts or read session/verification tokens.
ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."otp_tokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_server_api_only"
ON public."accounts" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "sessions_server_api_only"
ON public."sessions" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "verification_tokens_server_api_only"
ON public."verification_tokens" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "otp_tokens_server_api_only"
ON public."otp_tokens" AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

COMMIT;
