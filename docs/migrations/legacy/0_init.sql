-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'jugador', 'entrenador', 'club', 'agencia');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('empleo', 'prueba', 'torneo', 'clinica', 'beca', 'patrocinio');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada', 'cancelada');

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
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "planType" TEXT NOT NULL DEFAULT 'free_amateur',
    "planStart" TIMESTAMP(3),
    "planEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_tokens" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

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
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "status" "OpportunityStatus" NOT NULL DEFAULT 'borrador',
    "level" "OpportunityLevel" NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "modality" "Modality" NOT NULL DEFAULT 'presencial',
    "remunerationType" TEXT,
    "remunerationMin" DOUBLE PRECISION,
    "remunerationMax" DOUBLE PRECISION,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "state" "ApplicationState" NOT NULL DEFAULT 'enviada',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
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
    "secondaryPosition" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "wingspan" INTEGER,
    "dominantHand" TEXT,
    "currentLevel" TEXT,
    "lastTeam" TEXT,
    "currentCategory" TEXT,
    "playingStyle" TEXT,
    "languages" TEXT,
    "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
    "weeklyCommitment" INTEGER,
    "internationalExperience" BOOLEAN NOT NULL DEFAULT false,
    "hasLicense" BOOLEAN NOT NULL DEFAULT false,
    "injuryHistory" TEXT,
    "currentGoal" TEXT,
    "bio" TEXT,
    "videoUrl" TEXT,
    "fullGameUrl" TEXT,
    "socialUrl" TEXT,
    "photoUrls" TEXT,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OPEN_TO_OFFERS',
    "availableFrom" TIMESTAMP(3),
    "availabilityUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthYear" INTEGER,
    "nationality" TEXT NOT NULL DEFAULT 'España',
    "languages" TEXT,
    "city" TEXT NOT NULL,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "currentLevel" TEXT,
    "federativeLicense" TEXT,
    "totalExperience" INTEGER,
    "currentClub" TEXT,
    "previousClubs" TEXT,
    "categoriesCoached" TEXT,
    "achievements" TEXT,
    "internationalExp" BOOLEAN NOT NULL DEFAULT false,
    "internationalExpDesc" TEXT,
    "roleExperience" TEXT,
    "nationalTeamExp" BOOLEAN NOT NULL DEFAULT false,
    "trainingPlanning" INTEGER NOT NULL DEFAULT 3,
    "individualDevelopment" INTEGER NOT NULL DEFAULT 3,
    "offensiveTactics" INTEGER NOT NULL DEFAULT 3,
    "defensiveTactics" INTEGER NOT NULL DEFAULT 3,
    "groupManagement" INTEGER NOT NULL DEFAULT 3,
    "scoutingAnalysis" INTEGER NOT NULL DEFAULT 3,
    "staffManagement" INTEGER NOT NULL DEFAULT 3,
    "communication" INTEGER NOT NULL DEFAULT 3,
    "tacticalAdaptability" INTEGER NOT NULL DEFAULT 3,
    "digitalTools" INTEGER NOT NULL DEFAULT 3,
    "physicalPreparation" INTEGER NOT NULL DEFAULT 3,
    "youthDevelopment" INTEGER NOT NULL DEFAULT 3,
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
    "leadership" INTEGER NOT NULL DEFAULT 3,
    "teamwork" INTEGER NOT NULL DEFAULT 3,
    "conflictResolution" INTEGER NOT NULL DEFAULT 3,
    "organization" INTEGER NOT NULL DEFAULT 3,
    "adaptability" INTEGER NOT NULL DEFAULT 3,
    "innovation" INTEGER NOT NULL DEFAULT 3,
    "videoUrl" TEXT,
    "presentationsUrl" TEXT,
    "photoUrls" TEXT,
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_agency_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT,
    "entityType" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "commercialName" TEXT,
    "country" TEXT NOT NULL DEFAULT 'España',
    "province" TEXT,
    "city" TEXT NOT NULL,
    "website" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "competitions" TEXT,
    "sections" TEXT,
    "foundedYear" INTEGER,
    "rosterSize" INTEGER,
    "staffSize" INTEGER,
    "workingLanguages" TEXT,
    "contactPerson" TEXT,
    "contactRole" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
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
    "housingProvided" BOOLEAN NOT NULL DEFAULT false,
    "mealsTransport" BOOLEAN NOT NULL DEFAULT false,
    "medicalInsurance" BOOLEAN NOT NULL DEFAULT false,
    "contractType" TEXT,
    "visaSupport" BOOLEAN NOT NULL DEFAULT false,
    "requiredDocs" TEXT,
    "agentPolicy" TEXT,
    "scoutingNotes" TEXT,
    "logo" TEXT,
    "facilityPhotos" TEXT,
    "institutionalVideo" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "showEmailPublic" BOOLEAN NOT NULL DEFAULT false,
    "showPhonePublic" BOOLEAN NOT NULL DEFAULT false,
    "candidatesViaPortal" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "talent_profiles_userId_key" ON "talent_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_skills_talentProfileId_key" ON "player_skills"("talentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_userId_key" ON "coach_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_agency_profiles_userId_key" ON "club_agency_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_agency_profiles_slug_key" ON "club_agency_profiles"("slug");

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
CREATE INDEX "interest_notifications_createdAt_idx" ON "interest_notifications"("createdAt");

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
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_profiles" ADD CONSTRAINT "talent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_skills" ADD CONSTRAINT "player_skills_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_agency_profiles" ADD CONSTRAINT "club_agency_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "club_agency_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_leads" ADD CONSTRAINT "club_leads_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_notifications" ADD CONSTRAINT "interest_notifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_notifications" ADD CONSTRAINT "interest_notifications_interestedUserId_fkey" FOREIGN KEY ("interestedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_shortlists" ADD CONSTRAINT "talent_shortlists_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_shortlists" ADD CONSTRAINT "talent_shortlists_talentProfileId_fkey" FOREIGN KEY ("talentProfileId") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "talent_shortlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_clubUserId_fkey" FOREIGN KEY ("clubUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

