-- =========================================
-- SOLUCIÓN RÁPIDA: DESHABILITAR RLS EN STORAGE
-- =========================================
-- ADVERTENCIA: Esto hace el bucket completamente público
-- Solo úsalo si las políticas no funcionan
-- =========================================

-- Opción 1: Deshabilitar RLS en la tabla objects para el bucket uploads
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Opción 2: Crear una política permisiva que permita todo
CREATE POLICY "Allow All Operations"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Verificar
SELECT * FROM storage.buckets WHERE id = 'uploads';
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'objects';
