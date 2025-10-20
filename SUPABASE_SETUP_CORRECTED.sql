-- EJECUTAR EN SUPABASE SQL EDITOR (VERSIÓN CORREGIDA)
-- Crear todas las tablas y tipos necesarios

-- Crear enums (solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('admin', 'jugador', 'entrenador', 'club', 'agencia');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OpportunityType') THEN
        CREATE TYPE "OpportunityType" AS ENUM ('empleo', 'prueba', 'torneo', 'clinica', 'beca', 'patrocinio');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OpportunityLevel') THEN
        CREATE TYPE "OpportunityLevel" AS ENUM ('amateur', 'semi_profesional', 'profesional', 'cantera');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OpportunityStatus') THEN
        CREATE TYPE "OpportunityStatus" AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada', 'suspendida');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Modality') THEN
        CREATE TYPE "Modality" AS ENUM ('presencial', 'online', 'mixta');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationState') THEN
        CREATE TYPE "ApplicationState" AS ENUM ('enviada', 'en_revision', 'aceptada', 'rechazada', 'finalizada');
    END IF;
END $$;

-- Crear tablas principales
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT PRIMARY KEY,
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
    "session_state" TEXT
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "opportunities" (
    "id" TEXT PRIMARY KEY,
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
    "authorId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "applications" (
    "id" TEXT PRIMARY KEY,
    "state" "ApplicationState" NOT NULL DEFAULT 'enviada',
    "message" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_subscriptions" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT
);

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "opportunities_slug_key" ON "opportunities"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "applications_userId_opportunityId_key" ON "applications"("userId", "opportunityId");
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_userId_opportunityId_key" ON "favorites"("userId", "opportunityId");

-- Crear foreign keys (con verificación para evitar duplicados)
DO $$ 
BEGIN
    -- accounts -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'accounts_userId_fkey' AND table_name = 'accounts') THEN
        ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
    
    -- sessions -> users  
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessions_userId_fkey' AND table_name = 'sessions') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
    
    -- organizations -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organizations_ownerId_fkey' AND table_name = 'organizations') THEN
        ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    
    -- opportunities -> organizations
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'opportunities_organizationId_fkey' AND table_name = 'opportunities') THEN
        ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL;
    END IF;
    
    -- opportunities -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'opportunities_authorId_fkey' AND table_name = 'opportunities') THEN
        ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    
    -- applications -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_userId_fkey' AND table_name = 'applications') THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    
    -- applications -> opportunities
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_opportunityId_fkey' AND table_name = 'applications') THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE;
    END IF;
    
    -- favorites -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'favorites_userId_fkey' AND table_name = 'favorites') THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
    END IF;
    
    -- favorites -> opportunities
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'favorites_opportunityId_fkey' AND table_name = 'favorites') THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE;
    END IF;
    
    -- email_subscriptions -> users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'email_subscriptions_userId_fkey' AND table_name = 'email_subscriptions') THEN
        ALTER TABLE "email_subscriptions" ADD CONSTRAINT "email_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
    
    RAISE NOTICE 'Database schema setup completed successfully!';
END $$;