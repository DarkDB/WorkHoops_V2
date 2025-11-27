-- =========================================
-- SOLUCIÓN SIMPLE: DESHABILITAR RLS EN RESOURCES
-- =========================================

-- Solo necesitas ejecutar esta línea:
ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;

-- Verificar que funcionó:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'resources';

-- Deberías ver:
-- tablename | rowsecurity
-- ----------+-------------
-- resources | f
-- 
-- La "f" significa FALSE = RLS deshabilitado ✓

-- =========================================
-- ¡ESO ES TODO!
-- Ahora prueba crear un recurso en /admin/recursos
-- =========================================
