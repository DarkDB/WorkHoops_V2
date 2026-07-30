-- Add missing tables to Supabase database
-- Execute this in your Supabase SQL Editor
-- This script is idempotent - safe to run multiple times

-- 1. Create club_agency_profiles table
CREATE TABLE IF NOT EXISTS "public"."club_agency_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
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

    CONSTRAINT "club_agency_profiles_pkey" PRIMARY KEY ("id")
);

-- 2. Create unique index for userId (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'club_agency_profiles_userId_key'
    ) THEN
        CREATE UNIQUE INDEX "club_agency_profiles_userId_key" ON "public"."club_agency_profiles"("userId");
    END IF;
END $$;

-- 3. Add foreign key constraint (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'club_agency_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "public"."club_agency_profiles" 
        ADD CONSTRAINT "club_agency_profiles_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "public"."users"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Create interest_notifications table (skip if exists)
CREATE TABLE IF NOT EXISTS "public"."interest_notifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "interestedUserId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_notifications_pkey" PRIMARY KEY ("id")
);

-- 5. Add foreign key constraints for interest_notifications (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'interest_notifications_profileId_fkey'
    ) THEN
        ALTER TABLE "public"."interest_notifications" 
        ADD CONSTRAINT "interest_notifications_profileId_fkey" 
        FOREIGN KEY ("profileId") 
        REFERENCES "public"."talent_profiles"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'interest_notifications_interestedUserId_fkey'
    ) THEN
        ALTER TABLE "public"."interest_notifications" 
        ADD CONSTRAINT "interest_notifications_interestedUserId_fkey" 
        FOREIGN KEY ("interestedUserId") 
        REFERENCES "public"."users"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Verify tables and constraints
SELECT 
    tablename,
    'exists' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('club_agency_profiles', 'interest_notifications')
UNION ALL
SELECT 
    conname as tablename,
    'constraint exists' as status
FROM pg_constraint
WHERE conname IN (
    'club_agency_profiles_userId_fkey',
    'interest_notifications_profileId_fkey',
    'interest_notifications_interestedUserId_fkey'
);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Script executed successfully! Tables and constraints are ready.';
END $$;
