-- =====================================================
-- WORKHOOPS DATABASE SCHEMA
-- PostgreSQL (Supabase)
-- Generated: 2026-02-26
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE "UserRole" AS ENUM (
    'admin',
    'jugador',
    'entrenador',
    'club',
    'agencia'
);

CREATE TYPE "OpportunityType" AS ENUM (
    'empleo',
    'prueba',
    'torneo',
    'clinica',
    'beca',
    'patrocinio'
);

CREATE TYPE "OpportunityStatus" AS ENUM (
    'borrador',
    'pendiente',
    'publicada',
    'cerrada',
    'cancelada'
);

CREATE TYPE "OpportunityLevel" AS ENUM (
    'amateur',
    'semi_profesional',
    'profesional',
    'cantera'
);

CREATE TYPE "Modality" AS ENUM (
    'presencial',
    'online',
    'mixta'
);

CREATE TYPE "ApplicationState" AS ENUM (
    'enviada',
    'en_revision',
    'aceptada',
    'rechazada',
    'finalizada'
);

CREATE TYPE "ResourceStatus" AS ENUM (
    'draft',
    'published'
);

CREATE TYPE "ResourceCategory" AS ENUM (
    'preparacion',
    'carrera',
    'recursos',
    'salud',
    'tactica',
    'mental'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    name TEXT,
    image TEXT,
    role "UserRole" NOT NULL DEFAULT 'jugador',
    locale TEXT NOT NULL DEFAULT 'es',
    verified BOOLEAN NOT NULL DEFAULT false,
    "planType" TEXT NOT NULL DEFAULT 'free_amateur',
    "planStart" TIMESTAMP,
    "planEnd" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (NextAuth)
CREATE TABLE accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

-- Sessions table (NextAuth)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Verification tokens (NextAuth)
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- Organizations table
CREATE TABLE organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    website TEXT,
    logo TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL REFERENCES users(id)
);

-- Opportunities table
CREATE TABLE opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type "OpportunityType" NOT NULL,
    status "OpportunityStatus" NOT NULL DEFAULT 'borrador',
    level "OpportunityLevel" NOT NULL,
    city TEXT,
    country TEXT NOT NULL DEFAULT 'España',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    modality "Modality" NOT NULL DEFAULT 'presencial',
    "remunerationType" TEXT,
    "remunerationMin" DOUBLE PRECISION,
    "remunerationMax" DOUBLE PRECISION,
    currency TEXT NOT NULL DEFAULT 'EUR',
    benefits TEXT,
    deadline TIMESTAMP,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "publishedAt" TIMESTAMP,
    tags TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "applicationUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT REFERENCES organizations(id),
    "authorId" TEXT NOT NULL REFERENCES users(id)
);

-- Applications table
CREATE TABLE applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    state "ApplicationState" NOT NULL DEFAULT 'enviada',
    message TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityId" TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("userId", "opportunityId")
);

-- Favorites table
CREATE TABLE favorites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityId" TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("userId", "opportunityId")
);

-- Audit logs table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "actorId" TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    metadata TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "stripeSubscriptionId" TEXT UNIQUE NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    status TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP NOT NULL,
    "currentPeriodEnd" TIMESTAMP NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Talent profiles table
CREATE TABLE talent_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP NOT NULL,
    role TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'España',
    position TEXT,
    "secondaryPosition" TEXT,
    height INTEGER,
    weight INTEGER,
    wingspan INTEGER,
    "dominantHand" TEXT,
    "currentLevel" TEXT,
    "lastTeam" TEXT,
    "currentCategory" TEXT,
    "playingStyle" TEXT,
    languages TEXT,
    "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
    "weeklyCommitment" INTEGER,
    "internationalExperience" BOOLEAN NOT NULL DEFAULT false,
    "hasLicense" BOOLEAN NOT NULL DEFAULT false,
    "injuryHistory" TEXT,
    "currentGoal" TEXT,
    bio TEXT,
    "videoUrl" TEXT,
    "fullGameUrl" TEXT,
    "socialUrl" TEXT,
    "photoUrls" TEXT,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Player skills table
CREATE TABLE player_skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "talentProfileId" TEXT UNIQUE NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    "threePointShot" INTEGER NOT NULL DEFAULT 3,
    "midRangeShot" INTEGER NOT NULL DEFAULT 3,
    finishing INTEGER NOT NULL DEFAULT 3,
    "ballHandling" INTEGER NOT NULL DEFAULT 3,
    playmaking INTEGER NOT NULL DEFAULT 3,
    "offBallMovement" INTEGER NOT NULL DEFAULT 3,
    "individualDefense" INTEGER NOT NULL DEFAULT 3,
    "teamDefense" INTEGER NOT NULL DEFAULT 3,
    "offensiveRebound" INTEGER NOT NULL DEFAULT 3,
    "defensiveRebound" INTEGER NOT NULL DEFAULT 3,
    speed INTEGER NOT NULL DEFAULT 3,
    athleticism INTEGER NOT NULL DEFAULT 3,
    endurance INTEGER NOT NULL DEFAULT 3,
    leadership INTEGER NOT NULL DEFAULT 3,
    "decisionMaking" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Coach profiles table
CREATE TABLE coach_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "birthYear" INTEGER,
    nationality TEXT NOT NULL DEFAULT 'España',
    languages TEXT,
    city TEXT NOT NULL,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "currentLevel" TEXT,
    "federativeLicense" TEXT,
    "totalExperience" INTEGER,
    "currentClub" TEXT,
    "previousClubs" TEXT,
    "categoriesCoached" TEXT,
    achievements TEXT,
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
    communication INTEGER NOT NULL DEFAULT 3,
    "tacticalAdaptability" INTEGER NOT NULL DEFAULT 3,
    "digitalTools" INTEGER NOT NULL DEFAULT 3,
    "physicalPreparation" INTEGER NOT NULL DEFAULT 3,
    "youthDevelopment" INTEGER NOT NULL DEFAULT 3,
    "playingStyle" TEXT,
    "workPriority" TEXT,
    "playerTypePreference" TEXT,
    inspirations TEXT,
    "academicDegrees" TEXT,
    certifications TEXT,
    "coursesAttended" TEXT,
    "currentGoal" TEXT,
    "offerType" TEXT,
    availability TEXT,
    leadership INTEGER NOT NULL DEFAULT 3,
    teamwork INTEGER NOT NULL DEFAULT 3,
    "conflictResolution" INTEGER NOT NULL DEFAULT 3,
    organization INTEGER NOT NULL DEFAULT 3,
    adaptability INTEGER NOT NULL DEFAULT 3,
    innovation INTEGER NOT NULL DEFAULT 3,
    "videoUrl" TEXT,
    "presentationsUrl" TEXT,
    "photoUrls" TEXT,
    bio TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Club/Agency profiles table
CREATE TABLE club_agency_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "entityType" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "commercialName" TEXT,
    country TEXT NOT NULL DEFAULT 'España',
    province TEXT,
    city TEXT NOT NULL,
    website TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    competitions TEXT,
    sections TEXT,
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
    logo TEXT,
    "facilityPhotos" TEXT,
    "institutionalVideo" TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    "showEmailPublic" BOOLEAN NOT NULL DEFAULT false,
    "showPhonePublic" BOOLEAN NOT NULL DEFAULT false,
    "candidatesViaPortal" BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "profileCompletionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Interest notifications table
CREATE TABLE interest_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "profileId" TEXT NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    "interestedUserId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Resources table (Blog)
CREATE TABLE resources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category "ResourceCategory" NOT NULL,
    status "ResourceStatus" NOT NULL DEFAULT 'draft',
    featured BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    author TEXT NOT NULL,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    views INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX "accounts_userId_idx" ON accounts("userId");
CREATE INDEX "sessions_userId_idx" ON sessions("userId");
CREATE INDEX "organizations_ownerId_idx" ON organizations("ownerId");
CREATE INDEX "opportunities_organizationId_idx" ON opportunities("organizationId");
CREATE INDEX "opportunities_authorId_idx" ON opportunities("authorId");
CREATE INDEX "opportunities_status_idx" ON opportunities(status);
CREATE INDEX "opportunities_type_idx" ON opportunities(type);
CREATE INDEX "applications_opportunityId_idx" ON applications("opportunityId");
CREATE INDEX "applications_userId_idx" ON applications("userId");
CREATE INDEX "favorites_opportunityId_idx" ON favorites("opportunityId");
CREATE INDEX "favorites_userId_idx" ON favorites("userId");
CREATE INDEX "subscriptions_userId_idx" ON subscriptions("userId");
CREATE INDEX "interest_notifications_profileId_idx" ON interest_notifications("profileId");
CREATE INDEX "interest_notifications_interestedUserId_idx" ON interest_notifications("interestedUserId");
CREATE INDEX "interest_notifications_status_idx" ON interest_notifications(status);
CREATE INDEX "interest_notifications_createdAt_idx" ON interest_notifications("createdAt");
CREATE INDEX "resources_slug_idx" ON resources(slug);
CREATE INDEX "resources_category_idx" ON resources(category);
CREATE INDEX "resources_status_idx" ON resources(status);
CREATE INDEX "resources_featured_idx" ON resources(featured);
CREATE INDEX "resources_publishedAt_idx" ON resources("publishedAt");
CREATE INDEX "resources_userId_idx" ON resources("userId");
CREATE INDEX "notifications_userId_idx" ON notifications("userId");
CREATE INDEX "notifications_read_idx" ON notifications(read);
CREATE INDEX "notifications_createdAt_idx" ON notifications("createdAt");

-- =====================================================
-- END OF SCHEMA
-- =====================================================
