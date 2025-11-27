-- =========================================
-- CONFIGURAR RLS PARA TABLA RESOURCES
-- =========================================

-- Verificar estado actual de RLS en la tabla resources
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'resources';

-- =========================================
-- OPCIÓN 1: DESHABILITAR RLS (Más Simple)
-- =========================================

-- Deshabilitar RLS en la tabla resources
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- =========================================
-- OPCIÓN 2: CONFIGURAR POLÍTICAS (Recomendado)
-- =========================================

-- Si prefieres mantener RLS activo con políticas:

-- Primero, habilitar RLS si no está activo
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si hay
DROP POLICY IF EXISTS "Resources public read" ON resources;
DROP POLICY IF EXISTS "Resources admin all" ON resources;

-- Política 1: Permitir lectura pública de recursos publicados
CREATE POLICY "Resources public read"
ON resources
FOR SELECT
USING (status = 'published');

-- Política 2: Permitir todas las operaciones para usuarios autenticados con rol admin
-- NOTA: Esta política asume que tienes una columna userId en la tabla User
-- y que el session tiene acceso a user_id
CREATE POLICY "Resources admin all"
ON resources
FOR ALL
TO authenticated
USING (
  -- Permitir todo a admins
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User".id = auth.uid()::text
    AND "User".role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User".id = auth.uid()::text
    AND "User".role = 'admin'
  )
);

-- =========================================
-- VERIFICACIÓN
-- =========================================

-- Ver políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'resources';

-- Ver estado de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'resources';

-- =========================================
-- RECOMENDACIÓN
-- =========================================
-- Para desarrollo: Usa OPCIÓN 1 (deshabilitar RLS)
-- Para producción: Usa OPCIÓN 2 (con políticas)
-- 
-- Si usas OPCIÓN 1, comenta las líneas de OPCIÓN 2
-- Si usas OPCIÓN 2, comenta las líneas de OPCIÓN 1
