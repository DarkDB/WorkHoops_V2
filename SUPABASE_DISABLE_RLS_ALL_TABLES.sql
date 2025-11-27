-- =========================================
-- DESHABILITAR RLS EN TODAS LAS TABLAS
-- Para desarrollo/testing rápido
-- =========================================

-- ADVERTENCIA: Esto hace las tablas completamente accesibles
-- Solo úsalo en desarrollo o si no necesitas seguridad estricta

-- Deshabilitar RLS en tabla resources
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla User (si necesitas)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla Opportunity (si necesitas)
ALTER TABLE "Opportunity" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla Application (si necesitas)
ALTER TABLE "Application" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla TalentProfile (si necesitas)
ALTER TABLE "TalentProfile" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla CoachProfile (si necesitas)
ALTER TABLE "CoachProfile" DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en tabla ClubAgencyProfile (si necesitas)
ALTER TABLE "ClubAgencyProfile" DISABLE ROW LEVEL SECURITY;

-- Verificar estado
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS Activo' 
    ELSE '🔓 RLS Deshabilitado' 
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'resources', 
    'User', 
    'Opportunity', 
    'Application',
    'TalentProfile',
    'CoachProfile',
    'ClubAgencyProfile'
  )
ORDER BY tablename;
