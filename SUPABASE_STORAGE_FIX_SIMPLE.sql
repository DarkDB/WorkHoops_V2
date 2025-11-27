-- =========================================
-- SOLUCIÓN QUE FUNCIONA SIN PERMISOS ESPECIALES
-- =========================================

-- Paso 1: Eliminar TODAS las políticas existentes del bucket uploads
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Operations" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Paso 2: Crear UNA SOLA política super permisiva para el bucket uploads
CREATE POLICY "uploads_full_access"
ON storage.objects
FOR ALL
TO public, authenticated, anon
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Paso 3: Asegurar que el bucket es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'uploads';

-- Paso 4: Verificar
SELECT 
  policyname,
  roles,
  cmd as operacion
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname = 'uploads_full_access';

-- Deberías ver 1 política llamada "uploads_full_access"
