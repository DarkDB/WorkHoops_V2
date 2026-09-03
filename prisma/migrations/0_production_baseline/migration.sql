-- Canonical baseline of the Production schema as observed on 2026-09-02.
-- Apply to a new database only. Existing Production must be baselined with migrate resolve.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'jugador', 'entrenador', 'club', 'agencia');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('empleo', 'prueba', 'torneo', 'clinica', 'beca', 'patrocinio');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada', 'suspendida');

-- CreateEnum
CREATE TYPE "OpportunityLevel" AS ENUM ('amateur', 'semi_profesional', 'profesional', 'cantera');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('presencial', 'online', 'mixta');

-- CreateEnum
CREATE TYPE "ApplicationState" AS ENUM ('enviada', 'en_revision', 'aceptada', 'rechazada', 'finalizada');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('preparacion', 'carrera', 'recursos', 'salud', 'tactica', 'mental');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "TalentPipelineStatus" AS ENUM ('SAVED', 'CONTACTED', 'INVITED', 'SIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TalentInviteType" AS ENUM ('INVITE_TO_APPLY', 'INVITE_TO_TRYOUT');

-- CreateEnum
CREATE TYPE "TalentInviteStatus" AS ENUM ('SENT', 'VIEWED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ClubLeadStatus" AS ENUM ('NEW', 'REVIEWED', 'CONTACTED', 'REJECTED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'jugador',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "planType" TEXT NOT NULL DEFAULT 'free_amateur',
    "planStart" TIMESTAMP(3),
    "planEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(6),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(6),
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(6),

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "level" "OpportunityLevel" NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'borrador',
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "modality" "Modality" NOT NULL DEFAULT 'presencial',
    "remunerationType" TEXT,
    "remunerationMin" INTEGER,
    "remunerationMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "benefits" TEXT,
    "deadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "applicationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "state" "ApplicationState" NOT NULL DEFAULT 'enviada',
    "message" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_profiles" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "role" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'España',
    "position" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "bio" TEXT,
    "videoUrl" TEXT,
    "socialUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "secondaryPosition" TEXT,
    "wingspan" INTEGER,
    "dominantHand" TEXT,
    "currentLevel" TEXT,
    "lastTeam" TEXT,
    "currentCategory" TEXT,
    "playingStyle" TEXT,
    "languages" TEXT,
    "willingToTravel" BOOLEAN DEFAULT false,
    "weeklyCommitment" INTEGER,
    "internationalExperience" BOOLEAN DEFAULT false,
    "hasLicense" BOOLEAN DEFAULT false,
    "injuryHistory" TEXT,
    "currentGoal" TEXT,
    "fullGameUrl" TEXT,
    "photoUrls" TEXT,
    "profileCompletionPercentage" INTEGER DEFAULT 0,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OPEN_TO_OFFERS',
    "availableFrom" TIMESTAMP(3),
    "availabilityUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "talent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_skills" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    "threePointShot" INTEGER NOT NULL DEFAULT 3,
    "midRangeShot" INTEGER NOT NULL DEFAULT 3,
    "finishing" INTEGER NOT NULL DEFAULT 3,
    "ballHandling" INTEGER NOT NULL DEFAULT 3,
    "playmaking" INTEGER NOT NULL DEFAULT 3,
    "offBallMovement" INTEGER NOT NULL DEFAULT 3,
    "individualDefense" INTEGER NOT NULL DEFAULT 3,
    "teamDefense" INTEGER NOT NULL DEFAULT 3,
    "offensiveRebound" INTEGER NOT NULL DEFAULT 3,
    "defensiveRebound" INTEGER NOT NULL DEFAULT 3,
    "speed" INTEGER NOT NULL DEFAULT 3,
    "athleticism" INTEGER NOT NULL DEFAULT 3,
    "endurance" INTEGER NOT NULL DEFAULT 3,
    "leadership" INTEGER NOT NULL DEFAULT 3,
    "decisionMaking" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthYear" INTEGER,
    "nationality" TEXT DEFAULT 'España',
    "languages" TEXT,
    "city" TEXT NOT NULL,
    "willingToRelocate" BOOLEAN DEFAULT false,
    "currentLevel" TEXT,
    "federativeLicense" TEXT,
    "totalExperience" INTEGER,
    "currentClub" TEXT,
    "previousClubs" TEXT,
    "categoriesCoached" TEXT,
    "achievements" TEXT,
    "internationalExp" BOOLEAN DEFAULT false,
    "internationalExpDesc" TEXT,
    "roleExperience" TEXT,
    "nationalTeamExp" BOOLEAN DEFAULT false,
    "trainingPlanning" INTEGER DEFAULT 3,
    "individualDevelopment" INTEGER DEFAULT 3,
    "offensiveTactics" INTEGER DEFAULT 3,
    "defensiveTactics" INTEGER DEFAULT 3,
    "groupManagement" INTEGER DEFAULT 3,
    "scoutingAnalysis" INTEGER DEFAULT 3,
    "staffManagement" INTEGER DEFAULT 3,
    "communication" INTEGER DEFAULT 3,
    "tacticalAdaptability" INTEGER DEFAULT 3,
    "digitalTools" INTEGER DEFAULT 3,
    "physicalPreparation" INTEGER DEFAULT 3,
    "youthDevelopment" INTEGER DEFAULT 3,
    "playingStyle" TEXT,
    "workPriority" TEXT,
    "playerTypePreference" TEXT,
    "inspirations" TEXT,
    "academicDegrees" TEXT,
    "certifications" TEXT,
    "coursesAttended" TEXT,
    "currentGoal" TEXT,
    "offerType" TEXT,
    "availability" TEXT,
    "leadership" INTEGER DEFAULT 3,
    "teamwork" INTEGER DEFAULT 3,
    "conflictResolution" INTEGER DEFAULT 3,
    "organization" INTEGER DEFAULT 3,
    "adaptability" INTEGER DEFAULT 3,
    "innovation" INTEGER DEFAULT 3,
    "videoUrl" TEXT,
    "presentationsUrl" TEXT,
    "photoUrls" TEXT,
    "bio" TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "verified" BOOLEAN DEFAULT false,
    "profileCompletionPercentage" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_agency_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "city" TEXT NOT NULL,
    "address" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "divisions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "facilities" TEXT,
    "achievements" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commercialName" TEXT,
    "province" TEXT,
    "youtubeUrl" TEXT,
    "competitions" TEXT,
    "sections" TEXT,
    "rosterSize" INTEGER,
    "staffSize" INTEGER,
    "workingLanguages" TEXT,
    "contactRole" TEXT,
    "fiscalDocument" TEXT,
    "contactPreference" TEXT,
    "profilesNeeded" TEXT,
    "ageRangeMin" INTEGER,
    "ageRangeMax" INTEGER,
    "minHeightByPosition" TEXT,
    "experienceRequired" TEXT,
    "competitiveReqs" TEXT,
    "keySkills" TEXT,
    "availabilityNeeded" TEXT,
    "salaryRange" TEXT,
    "housingProvided" BOOLEAN DEFAULT false,
    "mealsTransport" BOOLEAN DEFAULT false,
    "medicalInsurance" BOOLEAN DEFAULT false,
    "contractType" TEXT,
    "visaSupport" BOOLEAN DEFAULT false,
    "requiredDocs" TEXT,
    "agentPolicy" TEXT,
    "scoutingNotes" TEXT,
    "facilityPhotos" TEXT,
    "institutionalVideo" TEXT,
    "showEmailPublic" BOOLEAN DEFAULT false,
    "showPhonePublic" BOOLEAN DEFAULT false,
    "candidatesViaPortal" BOOLEAN DEFAULT true,
    "profileCompletionPercentage" INTEGER DEFAULT 0,
    "slug" TEXT,

    CONSTRAINT "club_agency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_leads" (
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

-- CreateTable
CREATE TABLE "interest_notifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "interestedUserId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    "author" TEXT NOT NULL,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "viewerIp" TEXT,
    "viewerUserId" TEXT,
    "profileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dedupeKey" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "email_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otp_tokens_user_id_idx" ON "otp_tokens"("user_id");

-- CreateIndex
CREATE INDEX "otp_tokens_expires_at_idx" ON "otp_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "otp_tokens_used_at_idx" ON "otp_tokens"("used_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_key" ON "opportunities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_opportunityId_key" ON "applications"("userId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_opportunityId_key" ON "favorites"("userId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "talent_profiles_userId_key" ON "talent_profiles"("userId");

-- CreateIndex
CREATE INDEX "talent_profiles_ispublic_idx" ON "talent_profiles"("isPublic");

-- CreateIndex
CREATE INDEX "talent_profiles_role_idx" ON "talent_profiles"("role");

-- CreateIndex
CREATE INDEX "talent_profiles_userid_idx" ON "talent_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_skills_talentProfileId_key" ON "player_skills"("talentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_userId_key" ON "coach_profiles"("userId");

-- CreateIndex
CREATE INDEX "coach_profiles_city_idx" ON "coach_profiles"("city");

-- CreateIndex
CREATE INDEX "coach_profiles_currentLevel_idx" ON "coach_profiles"("currentLevel");

-- CreateIndex
CREATE INDEX "coach_profiles_isPublic_idx" ON "coach_profiles"("isPublic");

-- CreateIndex
CREATE INDEX "coach_profiles_userId_idx" ON "coach_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_agency_profiles_userId_key" ON "club_agency_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_agency_profiles_slug_key" ON "club_agency_profiles"("slug");

-- CreateIndex
CREATE INDEX "club_agency_profiles_city_idx" ON "club_agency_profiles"("city");

-- CreateIndex
CREATE INDEX "club_agency_profiles_entityType_idx" ON "club_agency_profiles"("entityType");

-- CreateIndex
CREATE INDEX "club_agency_profiles_verified_idx" ON "club_agency_profiles"("verified");

-- CreateIndex
CREATE INDEX "club_leads_clubUserId_createdAt_idx" ON "club_leads"("clubUserId", "createdAt");

-- CreateIndex
CREATE INDEX "club_leads_clubProfileId_status_idx" ON "club_leads"("clubProfileId", "status");

-- CreateIndex
CREATE INDEX "club_leads_sourceUserId_createdAt_idx" ON "club_leads"("sourceUserId", "createdAt");

-- CreateIndex
CREATE INDEX "interest_notifications_profileId_idx" ON "interest_notifications"("profileId");

-- CreateIndex
CREATE INDEX "interest_notifications_interestedUserId_idx" ON "interest_notifications"("interestedUserId");

-- CreateIndex
CREATE INDEX "interest_notifications_status_idx" ON "interest_notifications"("status");

-- CreateIndex
CREATE INDEX "interest_notifications_createdAt_idx" ON "interest_notifications"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "talent_shortlists_clubUserId_status_idx" ON "talent_shortlists"("clubUserId", "status");

-- CreateIndex
CREATE INDEX "talent_shortlists_talentProfileId_idx" ON "talent_shortlists"("talentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "talent_shortlists_clubUserId_talentProfileId_key" ON "talent_shortlists"("clubUserId", "talentProfileId");

-- CreateIndex
CREATE INDEX "talent_invitations_clubUserId_createdAt_idx" ON "talent_invitations"("clubUserId", "createdAt");

-- CreateIndex
CREATE INDEX "talent_invitations_talentProfileId_createdAt_idx" ON "talent_invitations"("talentProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "talent_invitations_status_idx" ON "talent_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "resources_slug_key" ON "resources"("slug");

-- CreateIndex
CREATE INDEX "resources_slug_idx" ON "resources"("slug");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "resources_featured_idx" ON "resources"("featured");

-- CreateIndex
CREATE INDEX "resources_publishedAt_idx" ON "resources"("publishedAt");

-- CreateIndex
CREATE INDEX "resources_userId_idx" ON "resources"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "funnel_events_eventName_createdAt_idx" ON "funnel_events"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "funnel_events_userId_createdAt_idx" ON "funnel_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "email_preferences_userId_idx" ON "email_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_userId_category_key" ON "email_preferences"("userId", "category");

-- CreateIndex
CREATE INDEX "profile_views_profileUserId_createdAt_idx" ON "profile_views"("profileUserId", "createdAt");

-- CreateIndex
CREATE INDEX "profile_views_viewerIp_profileUserId_createdAt_idx" ON "profile_views"("viewerIp", "profileUserId", "createdAt");

-- CreateIndex
CREATE INDEX "email_events_userId_category_createdAt_idx" ON "email_events"("userId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "email_events_email_template_createdAt_idx" ON "email_events"("email", "template", "createdAt");

-- CreateIndex
CREATE INDEX "email_events_dedupeKey_idx" ON "email_events"("dedupeKey");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "talent_profiles" ADD CONSTRAINT "talent_profiles_userid_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_skills" ADD CONSTRAINT "player_skills_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_agency_profiles" ADD CONSTRAINT "club_agency_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "club_agency_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_notifications" ADD CONSTRAINT "interest_notifications_interestedUserId_fkey" FOREIGN KEY ("interestedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_notifications" ADD CONSTRAINT "interest_notifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_shortlists" ADD CONSTRAINT "talent_shortlists_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_shortlists" ADD CONSTRAINT "talent_shortlists_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "talent_shortlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_events" ADD CONSTRAINT "funnel_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;


-- Production-only features captured through a read-only catalog query on 2026-09-02.
-- Prisma Migrate does not emit RLS enablement or policies.
-- Provider-managed extensions observed but not required by this schema: pg_stat_statements, supabase_vault, uuid-ossp, plpgsql.

-- RLS state. resources, notifications, and otp_tokens deliberately remain disabled.
ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."club_agency_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."club_leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."coach_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."email_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."funnel_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."interest_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."player_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profile_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."talent_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."talent_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."talent_shortlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification_tokens" ENABLE ROW LEVEL SECURITY;

-- RLS policies captured from pg_policies.
CREATE POLICY "Allow all operations on accounts" ON public."accounts" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on applications" ON public."applications" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "club_agency_profiles_delete_own" ON public."club_agency_profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "club_agency_profiles_insert_own" ON public."club_agency_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "club_agency_profiles_select_authenticated" ON public."club_agency_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("isPublic" = true));
CREATE POLICY "club_agency_profiles_select_own" ON public."club_agency_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "club_agency_profiles_select_public" ON public."club_agency_profiles" AS PERMISSIVE FOR SELECT TO public USING (("isPublic" = true));
CREATE POLICY "club_agency_profiles_update_own" ON public."club_agency_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((auth.uid())::text = "userId")) WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "club_leads_delete_admin" ON public."club_leads" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'admin'::"UserRole")))));
CREATE POLICY "club_leads_insert_public" ON public."club_leads" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM (users u
     JOIN club_agency_profiles cap ON ((cap."userId" = u.id)))
  WHERE ((u.id = club_leads."clubUserId") AND (cap.id = club_leads."clubProfileId") AND (u.role = ANY (ARRAY['club'::"UserRole", 'agencia'::"UserRole"]))))));
CREATE POLICY "club_leads_select_owner" ON public."club_leads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((("clubUserId" = (auth.uid())::text) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'admin'::"UserRole"))))));
CREATE POLICY "club_leads_update_owner" ON public."club_leads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((("clubUserId" = (auth.uid())::text) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'admin'::"UserRole")))))) WITH CHECK ((("clubUserId" = (auth.uid())::text) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'admin'::"UserRole"))))));
CREATE POLICY "coach_profiles_delete_own" ON public."coach_profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "coach_profiles_insert_own" ON public."coach_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "coach_profiles_select_authenticated" ON public."coach_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("isPublic" = true));
CREATE POLICY "coach_profiles_select_own" ON public."coach_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "coach_profiles_select_public" ON public."coach_profiles" AS PERMISSIVE FOR SELECT TO public USING (("isPublic" = true));
CREATE POLICY "coach_profiles_update_own" ON public."coach_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((auth.uid())::text = "userId")) WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "email_events_select_own_or_admin" ON public."email_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((("userId" = (auth.uid())::text) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'admin'::"UserRole"))))));
CREATE POLICY "email_preferences_delete_own" ON public."email_preferences" AS PERMISSIVE FOR DELETE TO "authenticated" USING (("userId" = (auth.uid())::text));
CREATE POLICY "email_preferences_insert_own" ON public."email_preferences" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (("userId" = (auth.uid())::text));
CREATE POLICY "email_preferences_select_own" ON public."email_preferences" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("userId" = (auth.uid())::text));
CREATE POLICY "email_preferences_update_own" ON public."email_preferences" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (("userId" = (auth.uid())::text)) WITH CHECK (("userId" = (auth.uid())::text));
CREATE POLICY "Allow all operations on email_subscriptions" ON public."email_subscriptions" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on favorites" ON public."favorites" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "funnel_events_select_own" ON public."funnel_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("userId" = (auth.uid())::text));
CREATE POLICY "interest_notifications_delete_sender" ON public."interest_notifications" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "interestedUserId"));
CREATE POLICY "interest_notifications_insert_authenticated" ON public."interest_notifications" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "interestedUserId"));
CREATE POLICY "interest_notifications_select_profile_owner" ON public."interest_notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = interest_notifications."profileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "interest_notifications_select_sender" ON public."interest_notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "interestedUserId"));
CREATE POLICY "interest_notifications_update_profile_owner" ON public."interest_notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = interest_notifications."profileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "Allow all operations on opportunities" ON public."opportunities" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on organizations" ON public."organizations" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "player_skills_delete_own" ON public."player_skills" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = player_skills."talentProfileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "player_skills_insert_own" ON public."player_skills" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = player_skills."talentProfileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "player_skills_select_own" ON public."player_skills" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = player_skills."talentProfileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "player_skills_select_public" ON public."player_skills" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = player_skills."talentProfileId") AND (talent_profiles."isPublic" = true)))));
CREATE POLICY "player_skills_update_own" ON public."player_skills" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles
  WHERE ((talent_profiles.id = player_skills."talentProfileId") AND (talent_profiles."userId" = (auth.uid())::text)))));
CREATE POLICY "Enable insert for authenticated users only" ON public."resources" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public."resources" AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Allow all operations on sessions" ON public."sessions" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "invitation_delete_sender" ON public."talent_invitations" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "clubUserId"));
CREATE POLICY "invitation_insert_sender" ON public."talent_invitations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "clubUserId"));
CREATE POLICY "invitation_update_receiver_status" ON public."talent_invitations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles tp
  WHERE ((tp.id = talent_invitations."talentProfileId") AND (tp."userId" = (auth.uid())::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM talent_profiles tp
  WHERE ((tp.id = talent_invitations."talentProfileId") AND (tp."userId" = (auth.uid())::text)))));
CREATE POLICY "invitation_update_sender" ON public."talent_invitations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((auth.uid())::text = "clubUserId")) WITH CHECK (((auth.uid())::text = "clubUserId"));
CREATE POLICY "invitations_select_receiver" ON public."talent_invitations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM talent_profiles tp
  WHERE ((tp.id = talent_invitations."talentProfileId") AND (tp."userId" = (auth.uid())::text)))));
CREATE POLICY "invitations_select_sender" ON public."talent_invitations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "clubUserId"));
CREATE POLICY "talent_profiles_delete_own" ON public."talent_profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "talent_profiles_insert_own" ON public."talent_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "talent_profiles_select_authenticated" ON public."talent_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("isPublic" = true));
CREATE POLICY "talent_profiles_select_own" ON public."talent_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "userId"));
CREATE POLICY "talent_profiles_select_public" ON public."talent_profiles" AS PERMISSIVE FOR SELECT TO public USING (("isPublic" = true));
CREATE POLICY "talent_profiles_update_own" ON public."talent_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((auth.uid())::text = "userId")) WITH CHECK (((auth.uid())::text = "userId"));
CREATE POLICY "shortlist_delete_own" ON public."talent_shortlists" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid())::text = "clubUserId"));
CREATE POLICY "shortlist_insert_own" ON public."talent_shortlists" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((auth.uid())::text = "clubUserId"));
CREATE POLICY "shortlist_select_own" ON public."talent_shortlists" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid())::text = "clubUserId"));
CREATE POLICY "shortlist_update_own" ON public."talent_shortlists" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((auth.uid())::text = "clubUserId")) WITH CHECK (((auth.uid())::text = "clubUserId"));
CREATE POLICY "Allow all operations on users" ON public."users" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on verification_tokens" ON public."verification_tokens" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
