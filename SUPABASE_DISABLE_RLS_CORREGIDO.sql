-- =========================================
-- DESHABILITAR RLS - VERSIÓN CORREGIDA
-- Usando nombres correctos de tablas en BD
-- =========================================

-- Deshabilitar RLS en tabla resources (PRINCIPAL)
ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en otras tablas (OPCIONAL)
-- Descomenta solo si necesitas

-- ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "opportunities" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "applications" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "talent_profiles" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "coach_profiles" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "club_agency_profiles" DISABLE ROW LEVEL SECURITY;

-- Verificar estado de RLS
SELECT 
  tablename, 
  CASE 
    WHEN rowsecurity THEN '🔒 RLS Activo' 
    ELSE '🔓 RLS Deshabilitado' 
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'resources',
    'users',
    'opportunities',
    'applications',
    'talent_profiles',
    'coach_profiles',
    'club_agency_profiles'
  )
ORDER BY tablename;

-- =========================================
-- RESULTADO ESPERADO PARA "resources":
-- tablename | estado
-- ----------+--------------------
-- resources | 🔓 RLS Deshabilitado
-- =========================================
