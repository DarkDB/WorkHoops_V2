-- Actualización del schema para perfiles de jugador mejorados
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevos campos a talent_profiles
ALTER TABLE "public"."talent_profiles"
ADD COLUMN IF NOT EXISTS "secondaryPosition" TEXT,
ADD COLUMN IF NOT EXISTS "wingspan" INTEGER,
ADD COLUMN IF NOT EXISTS "dominantHand" TEXT,
ADD COLUMN IF NOT EXISTS "currentLevel" TEXT,
ADD COLUMN IF NOT EXISTS "lastTeam" TEXT,
ADD COLUMN IF NOT EXISTS "currentCategory" TEXT,
ADD COLUMN IF NOT EXISTS "playingStyle" TEXT,
ADD COLUMN IF NOT EXISTS "languages" TEXT,
ADD COLUMN IF NOT EXISTS "willingToTravel" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "weeklyCommitment" INTEGER,
ADD COLUMN IF NOT EXISTS "internationalExperience" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasLicense" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "injuryHistory" TEXT,
ADD COLUMN IF NOT EXISTS "currentGoal" TEXT,
ADD COLUMN IF NOT EXISTS "fullGameUrl" TEXT,
ADD COLUMN IF NOT EXISTS "photoUrls" TEXT,
ADD COLUMN IF NOT EXISTS "profileCompletionPercentage" INTEGER DEFAULT 0;

-- 2. Crear tabla player_skills
CREATE TABLE IF NOT EXISTS "public"."player_skills" (
    "id" TEXT NOT NULL,
    "talentProfileId" TEXT NOT NULL,
    
    -- Habilidades ofensivas (1-5)
    "threePointShot" INTEGER NOT NULL DEFAULT 3,
    "midRangeShot" INTEGER NOT NULL DEFAULT 3,
    "finishing" INTEGER NOT NULL DEFAULT 3,
    "ballHandling" INTEGER NOT NULL DEFAULT 3,
    "playmaking" INTEGER NOT NULL DEFAULT 3,
    "offBallMovement" INTEGER NOT NULL DEFAULT 3,
    
    -- Habilidades defensivas (1-5)
    "individualDefense" INTEGER NOT NULL DEFAULT 3,
    "teamDefense" INTEGER NOT NULL DEFAULT 3,
    "offensiveRebound" INTEGER NOT NULL DEFAULT 3,
    "defensiveRebound" INTEGER NOT NULL DEFAULT 3,
    
    -- Atributos físicos (1-5)
    "speed" INTEGER NOT NULL DEFAULT 3,
    "athleticism" INTEGER NOT NULL DEFAULT 3,
    "endurance" INTEGER NOT NULL DEFAULT 3,
    
    -- Atributos mentales (1-5)
    "leadership" INTEGER NOT NULL DEFAULT 3,
    "decisionMaking" INTEGER NOT NULL DEFAULT 3,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_skills_pkey" PRIMARY KEY ("id")
);

-- 3. Crear índice único para talentProfileId
CREATE UNIQUE INDEX IF NOT EXISTS "player_skills_talentProfileId_key" 
ON "public"."player_skills"("talentProfileId");

-- 4. Agregar foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'player_skills_talentProfileId_fkey'
    ) THEN
        ALTER TABLE "public"."player_skills" 
        ADD CONSTRAINT "player_skills_talentProfileId_fkey" 
        FOREIGN KEY ("talentProfileId") 
        REFERENCES "public"."talent_profiles"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Actualizar perfiles existentes con valores por defecto
UPDATE "public"."talent_profiles"
SET 
    "profileCompletionPercentage" = 30, -- Ya tienen datos básicos
    "willingToTravel" = false,
    "internationalExperience" = false,
    "hasLicense" = false
WHERE "profileCompletionPercentage" = 0;

-- 6. Verificar que las tablas se crearon correctamente
SELECT 
    tablename,
    'exists' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('talent_profiles', 'player_skills');

-- 7. Verificar constraints
SELECT 
    conname as constraint_name,
    'exists' as status
FROM pg_constraint
WHERE conname IN (
    'player_skills_talentProfileId_fkey',
    'player_skills_talentProfileId_key'
);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema actualizado correctamente! Nuevos campos agregados a talent_profiles y tabla player_skills creada.';
END $$;
