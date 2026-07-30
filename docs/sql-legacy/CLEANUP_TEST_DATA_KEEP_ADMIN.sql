-- =========================================
-- LIMPIAR DATOS DE PRUEBA - WORKHOOPS
-- Preserva usuario admin@workhoops.com
-- =========================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Studio: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto WorkHoops
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Copia y pega este script completo
-- 5. Click en "RUN" para ejecutar
-- 6. Verifica los resultados
-- =========================================

BEGIN;

-- =========================================
-- PASO 1: Eliminar aplicaciones (Applications)
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "Application";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminadas % aplicaciones', deleted_count;
END $$;

-- =========================================
-- PASO 2: Eliminar PlayerSkills relacionados con TalentProfile
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "PlayerSkills";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminadas % PlayerSkills', deleted_count;
END $$;

-- =========================================
-- PASO 3: Eliminar todos los perfiles de talento
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "TalentProfile";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminados % perfiles de talento (jugadores)', deleted_count;
END $$;

-- =========================================
-- PASO 4: Eliminar todos los perfiles de coach
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "CoachProfile";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminados % perfiles de coach (entrenadores)', deleted_count;
END $$;

-- =========================================
-- PASO 5: Eliminar todos los perfiles de club/agencia
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "ClubAgencyProfile";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminados % perfiles de club/agencia', deleted_count;
END $$;

-- =========================================
-- PASO 6: Eliminar todas las oportunidades
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "Opportunity";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminadas % oportunidades', deleted_count;
END $$;

-- =========================================
-- PASO 7: Eliminar notificaciones de interés
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "InterestNotification";
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Eliminadas % notificaciones de interés', deleted_count;
END $$;

-- =========================================
-- PASO 8: Eliminar usuarios (EXCEPTO admin@workhoops.com)
-- =========================================
DO $$
DECLARE
  deleted_count INTEGER;
  admin_id TEXT;
BEGIN
  -- Obtener ID del admin para preservarlo
  SELECT id INTO admin_id FROM "User" WHERE email = 'admin@workhoops.com';
  
  IF admin_id IS NOT NULL THEN
    -- Eliminar todos excepto admin
    DELETE FROM "User" WHERE email != 'admin@workhoops.com';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Eliminados % usuarios (preservado admin@workhoops.com)', deleted_count;
    RAISE NOTICE 'Usuario admin preservado con ID: %', admin_id;
  ELSE
    RAISE WARNING 'No se encontró usuario admin@workhoops.com - no se eliminó ningún usuario por seguridad';
  END IF;
END $$;

-- =========================================
-- PASO 9: Resetear secuencias (opcional)
-- Esto reinicia los IDs automáticos, pero Prisma usa UUIDs así que no es necesario
-- =========================================
-- ALTER SEQUENCE "Application_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "Opportunity_id_seq" RESTART WITH 1;

-- =========================================
-- VERIFICACIÓN FINAL
-- =========================================
DO $$
DECLARE
  user_count INTEGER;
  opportunity_count INTEGER;
  application_count INTEGER;
  talent_profile_count INTEGER;
  coach_profile_count INTEGER;
  club_profile_count INTEGER;
  admin_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO user_count FROM "User";
  SELECT COUNT(*) INTO opportunity_count FROM "Opportunity";
  SELECT COUNT(*) INTO application_count FROM "Application";
  SELECT COUNT(*) INTO talent_profile_count FROM "TalentProfile";
  SELECT COUNT(*) INTO coach_profile_count FROM "CoachProfile";
  SELECT COUNT(*) INTO club_profile_count FROM "ClubAgencyProfile";
  SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'admin@workhoops.com') INTO admin_exists;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE LIMPIEZA COMPLETADA:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Usuarios restantes: % (debería ser 1 - admin)', user_count;
  RAISE NOTICE 'Oportunidades restantes: % (debería ser 0)', opportunity_count;
  RAISE NOTICE 'Aplicaciones restantes: % (debería ser 0)', application_count;
  RAISE NOTICE 'Perfiles de talento restantes: % (debería ser 0)', talent_profile_count;
  RAISE NOTICE 'Perfiles de coach restantes: % (debería ser 0)', coach_profile_count;
  RAISE NOTICE 'Perfiles de club restantes: % (debería ser 0)', club_profile_count;
  RAISE NOTICE 'Admin preservado: %', CASE WHEN admin_exists THEN 'SÍ ✓' ELSE 'NO ✗' END;
  RAISE NOTICE '========================================';
  
  IF NOT admin_exists THEN
    RAISE EXCEPTION 'ERROR: Usuario admin@workhoops.com fue eliminado accidentalmente. Ejecuta ROLLBACK;';
  END IF;
END $$;

-- =========================================
-- COMMIT: Si todo está bien, ejecuta esto para confirmar los cambios
-- Si algo salió mal, ejecuta ROLLBACK; en su lugar
-- =========================================
COMMIT;

-- =========================================
-- NOTA: Si quieres deshacer los cambios ANTES de hacer COMMIT,
-- ejecuta este comando en lugar de COMMIT:
-- ROLLBACK;
-- =========================================
