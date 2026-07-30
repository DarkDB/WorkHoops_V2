-- EJECUTAR EN SUPABASE SQL EDITOR
-- Crear todas las tablas y tipos necesarios

-- Crear enums
CREATE TYPE "UserRole" AS ENUM ('admin', 'jugador', 'entrenador', 'club', 'agencia');
CREATE TYPE "OpportunityType" AS ENUM ('empleo', 'prueba', 'torneo', 'clinica', 'beca', 'patrocinio');
CREATE TYPE "OpportunityLevel" AS ENUM ('amateur', 'semi_profesional', 'profesional', 'cantera');
CREATE TYPE "OpportunityStatus" AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada', 'suspendida');
CREATE TYPE "Modality" AS ENUM ('presencial', 'online', 'mixta');
CREATE TYPE "ApplicationState" AS ENUM ('enviada', 'en_revision', 'aceptada', 'rechazada', 'finalizada');

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
    "session_state" TEXT,
    UNIQUE("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    UNIQUE("identifier", "token")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
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
    "slug" TEXT UNIQUE NOT NULL,
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
    "slug" TEXT UNIQUE NOT NULL,
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
    "opportunityId" TEXT NOT NULL,
    UNIQUE("userId", "opportunityId")
);

CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    UNIQUE("userId", "opportunityId")
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

-- Crear foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT IF NOT EXISTS "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT IF NOT EXISTS "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "organizations" ADD CONSTRAINT IF NOT EXISTS "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT;
ALTER TABLE "opportunities" ADD CONSTRAINT IF NOT EXISTS "opportunities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL;
ALTER TABLE "opportunities" ADD CONSTRAINT IF NOT EXISTS "opportunities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT;
ALTER TABLE "applications" ADD CONSTRAINT IF NOT EXISTS "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
ALTER TABLE "applications" ADD CONSTRAINT IF NOT EXISTS "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT;
ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE;
ALTER TABLE "email_subscriptions" ADD CONSTRAINT IF NOT EXISTS "email_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;