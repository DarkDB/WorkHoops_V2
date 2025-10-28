-- WorkHoops - Actualización de Schema para Entrenadores y Clubs/Agencias
-- Fecha: 28 de Octubre 2024
-- Descripción: Agrega tabla CoachProfile y expande ClubAgencyProfile

-- =====================================================
-- 1. CREAR TABLA COACH_PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS "coach_profiles" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  
  -- Datos Generales
  "fullName" TEXT NOT NULL,
  "birthYear" INTEGER,
  "nationality" TEXT DEFAULT 'España',
  "languages" TEXT, -- JSON array
  "city" TEXT NOT NULL,
  "willingToRelocate" BOOLEAN DEFAULT false,
  "currentLevel" TEXT,
  "federativeLicense" TEXT,
  "totalExperience" INTEGER,
  
  -- Experiencia y Trayectoria
  "currentClub" TEXT,
  "previousClubs" TEXT,
  "categoriesCoached" TEXT, -- JSON array
  "achievements" TEXT,
  "internationalExp" BOOLEAN DEFAULT false,
  "internationalExpDesc" TEXT,
  "roleExperience" TEXT,
  "nationalTeamExp" BOOLEAN DEFAULT false,
  
  -- Skills Técnicas y Tácticas (1-5)
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
  
  -- Filosofía y Estilo
  "playingStyle" TEXT, -- JSON array
  "workPriority" TEXT,
  "playerTypePreference" TEXT,
  "inspirations" TEXT,
  
  -- Formación
  "academicDegrees" TEXT,
  "certifications" TEXT,
  "coursesAttended" TEXT,
  
  -- Objetivos
  "currentGoal" TEXT,
  "offerType" TEXT,
  "availability" TEXT,
  
  -- Competencias Personales (1-5)
  "leadership" INTEGER DEFAULT 3,
  "teamwork" INTEGER DEFAULT 3,
  "conflictResolution" INTEGER DEFAULT 3,
  "organization" INTEGER DEFAULT 3,
  "adaptability" INTEGER DEFAULT 3,
  "innovation" INTEGER DEFAULT 3,
  
  -- Multimedia
  "videoUrl" TEXT,
  "presentationsUrl" TEXT,
  "photoUrls" TEXT, -- JSON array
  
  -- Meta
  "bio" TEXT,
  "isPublic" BOOLEAN DEFAULT true,
  "verified" BOOLEAN DEFAULT false,
  "profileCompletionPercentage" INTEGER DEFAULT 0,
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Índices para CoachProfile
CREATE INDEX IF NOT EXISTS "coach_profiles_userId_idx" ON "coach_profiles"("userId");
CREATE INDEX IF NOT EXISTS "coach_profiles_city_idx" ON "coach_profiles"("city");
CREATE INDEX IF NOT EXISTS "coach_profiles_currentLevel_idx" ON "coach_profiles"("currentLevel");
CREATE INDEX IF NOT EXISTS "coach_profiles_isPublic_idx" ON "coach_profiles"("isPublic");

-- =====================================================
-- 2. ACTUALIZAR TABLA CLUB_AGENCY_PROFILES
-- =====================================================

-- Verificar si existen columnas antiguas y agregar las nuevas
DO $$ 
BEGIN
  -- Renombrar campos antiguos si existen
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='club_agency_profiles' AND column_name='organizationName') THEN
    ALTER TABLE "club_agency_profiles" RENAME COLUMN "organizationName" TO "legalName";
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='club_agency_profiles' AND column_name='organizationType') THEN
    ALTER TABLE "club_agency_profiles" RENAME COLUMN "organizationType" TO "entityType";
  END IF;
END $$;

-- Agregar nuevas columnas si no existen
ALTER TABLE "club_agency_profiles" 
  ADD COLUMN IF NOT EXISTS "legalName" TEXT,
  ADD COLUMN IF NOT EXISTS "commercialName" TEXT,
  ADD COLUMN IF NOT EXISTS "entityType" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "competitions" TEXT,
  ADD COLUMN IF NOT EXISTS "sections" TEXT,
  ADD COLUMN IF NOT EXISTS "rosterSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "staffSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "workingLanguages" TEXT,
  ADD COLUMN IF NOT EXISTS "contactRole" TEXT,
  ADD COLUMN IF NOT EXISTS "fiscalDocument" TEXT,
  ADD COLUMN IF NOT EXISTS "contactPreference" TEXT,
  ADD COLUMN IF NOT EXISTS "profilesNeeded" TEXT,
  ADD COLUMN IF NOT EXISTS "ageRangeMin" INTEGER,
  ADD COLUMN IF NOT EXISTS "ageRangeMax" INTEGER,
  ADD COLUMN IF NOT EXISTS "minHeightByPosition" TEXT,
  ADD COLUMN IF NOT EXISTS "experienceRequired" TEXT,
  ADD COLUMN IF NOT EXISTS "competitiveReqs" TEXT,
  ADD COLUMN IF NOT EXISTS "keySkills" TEXT,
  ADD COLUMN IF NOT EXISTS "availabilityNeeded" TEXT,
  ADD COLUMN IF NOT EXISTS "salaryRange" TEXT,
  ADD COLUMN IF NOT EXISTS "housingProvided" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "mealsTransport" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "medicalInsurance" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "contractType" TEXT,
  ADD COLUMN IF NOT EXISTS "visaSupport" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "requiredDocs" TEXT,
  ADD COLUMN IF NOT EXISTS "agentPolicy" TEXT,
  ADD COLUMN IF NOT EXISTS "scoutingNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "facilityPhotos" TEXT,
  ADD COLUMN IF NOT EXISTS "institutionalVideo" TEXT,
  ADD COLUMN IF NOT EXISTS "showEmailPublic" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "showPhonePublic" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "candidatesViaPortal" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "profileCompletionPercentage" INTEGER DEFAULT 0;

-- Eliminar columnas antiguas que ya no se usan (opcional, comentado por seguridad)
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "coverImage";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "address";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "categories";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "divisions";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "facilities";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "achievements";
-- ALTER TABLE "club_agency_profiles" DROP COLUMN IF EXISTS "facebookUrl";

-- Índices adicionales para ClubAgencyProfile
CREATE INDEX IF NOT EXISTS "club_agency_profiles_entityType_idx" ON "club_agency_profiles"("entityType");
CREATE INDEX IF NOT EXISTS "club_agency_profiles_city_idx" ON "club_agency_profiles"("city");
CREATE INDEX IF NOT EXISTS "club_agency_profiles_verified_idx" ON "club_agency_profiles"("verified");

-- =====================================================
-- 3. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Tablas actualizadas exitosamente:';
  RAISE NOTICE '- coach_profiles creada';
  RAISE NOTICE '- club_agency_profiles actualizada con nuevos campos';
  RAISE NOTICE 'Siguiente paso: Aplicar políticas RLS desde SUPABASE_RLS_POLICIES.sql';
END $$;
