-- =========================================
-- MIGRAR ESTADOS DE APLICACIONES
-- De valores antiguos a nuevos
-- =========================================

-- IMPORTANTE: Ejecutar ANTES de hacer deploy del nuevo código

BEGIN;

-- Ver estados actuales antes de migrar
DO $$
DECLARE
    enviada_count INTEGER;
    finalizada_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enviada_count FROM "Application" WHERE state = 'enviada';
    SELECT COUNT(*) INTO finalizada_count FROM "Application" WHERE state = 'finalizada';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ESTADOS ANTES DE MIGRAR:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Aplicaciones con estado "enviada": %', enviada_count;
    RAISE NOTICE 'Aplicaciones con estado "finalizada": %', finalizada_count;
    RAISE NOTICE '========================================';
END $$;

-- Migrar estados
-- enviada → pendiente
UPDATE "Application" 
SET state = 'pendiente' 
WHERE state = 'enviada';

-- finalizada → aceptada (asumimos que finalizadas son aceptadas)
UPDATE "Application" 
SET state = 'aceptada' 
WHERE state = 'finalizada';

-- Ver estados después de migrar
DO $$
DECLARE
    pendiente_count INTEGER;
    en_revision_count INTEGER;
    vista_count INTEGER;
    rechazada_count INTEGER;
    aceptada_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pendiente_count FROM "Application" WHERE state = 'pendiente';
    SELECT COUNT(*) INTO en_revision_count FROM "Application" WHERE state = 'en_revision';
    SELECT COUNT(*) INTO vista_count FROM "Application" WHERE state = 'vista';
    SELECT COUNT(*) INTO rechazada_count FROM "Application" WHERE state = 'rechazada';
    SELECT COUNT(*) INTO aceptada_count FROM "Application" WHERE state = 'aceptada';
    SELECT COUNT(*) INTO total_count FROM "Application";
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ESTADOS DESPUÉS DE MIGRAR:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pendiente: %', pendiente_count;
    RAISE NOTICE 'En Revisión: %', en_revision_count;
    RAISE NOTICE 'Vista: %', vista_count;
    RAISE NOTICE 'Rechazada: %', rechazada_count;
    RAISE NOTICE 'Aceptada: %', aceptada_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TOTAL: %', total_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migración completada';
END $$;

COMMIT;

-- =========================================
-- ACTUALIZAR ENUM EN POSTGRESQL
-- =========================================

-- Nota: Esta parte es más compleja porque PostgreSQL no permite
-- modificar ENUMs fácilmente. Si tienes aplicaciones existentes,
-- es mejor mantener los valores antiguos en el ENUM y mapearlos
-- en el código.

-- Si prefieres actualizar el ENUM (requiere recrear):
/*
-- Paso 1: Crear nuevo ENUM
CREATE TYPE "ApplicationState_new" AS ENUM ('pendiente', 'en_revision', 'vista', 'rechazada', 'aceptada');

-- Paso 2: Alterar columna (esto puede fallar si hay datos)
ALTER TABLE "Application" 
  ALTER COLUMN state TYPE "ApplicationState_new" 
  USING state::text::"ApplicationState_new";

-- Paso 3: Eliminar enum antiguo y renombrar
DROP TYPE "ApplicationState";
ALTER TYPE "ApplicationState_new" RENAME TO "ApplicationState";
*/
