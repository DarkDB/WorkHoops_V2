-- Phase 2: Shortlist, invitations and recruitment pipeline
CREATE TYPE "TalentPipelineStatus" AS ENUM ('SAVED', 'CONTACTED', 'INVITED', 'SIGNED', 'REJECTED');
CREATE TYPE "TalentInviteType" AS ENUM ('INVITE_TO_APPLY', 'INVITE_TO_TRYOUT');
CREATE TYPE "TalentInviteStatus" AS ENUM ('SENT', 'VIEWED', 'ACCEPTED', 'DECLINED');

CREATE TABLE "talent_shortlists" (
  "id" TEXT NOT NULL,
  "clubUserId" TEXT NOT NULL,
  "talentProfileId" TEXT NOT NULL,
  "status" "TalentPipelineStatus" NOT NULL DEFAULT 'SAVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastStatusAt" TIMESTAMP(3),

  CONSTRAINT "talent_shortlists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "talent_invitations" (
  "id" TEXT NOT NULL,
  "shortlistId" TEXT,
  "clubUserId" TEXT NOT NULL,
  "talentProfileId" TEXT NOT NULL,
  "type" "TalentInviteType" NOT NULL,
  "status" "TalentInviteStatus" NOT NULL DEFAULT 'SENT',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "respondedAt" TIMESTAMP(3),

  CONSTRAINT "talent_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "talent_shortlists_clubUserId_talentProfileId_key" ON "talent_shortlists"("clubUserId", "talentProfileId");
CREATE INDEX "talent_shortlists_clubUserId_status_idx" ON "talent_shortlists"("clubUserId", "status");
CREATE INDEX "talent_shortlists_talentProfileId_idx" ON "talent_shortlists"("talentProfileId");

CREATE INDEX "talent_invitations_clubUserId_createdAt_idx" ON "talent_invitations"("clubUserId", "createdAt");
CREATE INDEX "talent_invitations_talentProfileId_createdAt_idx" ON "talent_invitations"("talentProfileId", "createdAt");
CREATE INDEX "talent_invitations_status_idx" ON "talent_invitations"("status");

ALTER TABLE "talent_shortlists"
  ADD CONSTRAINT "talent_shortlists_clubUserId_fkey"
  FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "talent_shortlists"
  ADD CONSTRAINT "talent_shortlists_talentProfileId_fkey"
  FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "talent_invitations"
  ADD CONSTRAINT "talent_invitations_shortlistId_fkey"
  FOREIGN KEY ("shortlistId") REFERENCES "talent_shortlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "talent_invitations"
  ADD CONSTRAINT "talent_invitations_clubUserId_fkey"
  FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "talent_invitations"
  ADD CONSTRAINT "talent_invitations_talentProfileId_fkey"
  FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
