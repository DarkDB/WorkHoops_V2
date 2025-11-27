-- =========================================
-- CONFIGURAR POLÍTICAS DE SUPABASE STORAGE
-- Para el bucket "uploads"
-- =========================================

-- IMPORTANTE: Ejecuta este script en Supabase SQL Editor

-- Paso 1: Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'uploads';

-- Si no existe, crearlo:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('uploads', 'uploads', true);

-- Paso 2: ELIMINAR políticas existentes que puedan estar causando conflicto
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Paso 3: CREAR políticas correctas

-- Política 1: Permitir lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Política 2: Permitir upload para usuarios autenticados
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Política 3: Permitir actualización para usuarios autenticados
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Política 4: Permitir eliminación para usuarios autenticados
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- Paso 4: Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects';

-- Paso 5: Asegurar que el bucket es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'uploads';

-- =========================================
-- VERIFICACIÓN FINAL
-- =========================================
DO $$
DECLARE
    bucket_exists BOOLEAN;
    bucket_is_public BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Verificar bucket
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'uploads') INTO bucket_exists;
    SELECT public FROM storage.buckets WHERE id = 'uploads' INTO bucket_is_public;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname LIKE '%Access%';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE STORAGE:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Bucket "uploads" existe: %', bucket_exists;
    RAISE NOTICE 'Bucket es público: %', bucket_is_public;
    RAISE NOTICE 'Políticas configuradas: %', policy_count;
    RAISE NOTICE '========================================';
    
    IF bucket_exists AND bucket_is_public AND policy_count >= 4 THEN
        RAISE NOTICE '✅ Configuración correcta!';
    ELSE
        RAISE WARNING '⚠️ Configuración incompleta. Verifica los pasos.';
    END IF;
END $$;
