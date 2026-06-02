# 🔧 Solución Error Upload de Imágenes

## ❌ Error Actual
```
new row violates row-level security policy
```

Este error significa que las políticas de seguridad (RLS) están bloqueando el upload.

---

## ✅ Solución (3 Opciones)

### **OPCIÓN 1: Configurar Políticas Correctamente (Recomendada)**

#### **Paso 1: Ve a Supabase SQL Editor**
1. https://supabase.com/dashboard
2. Tu proyecto → **SQL Editor** (menú lateral)
3. Click **"New Query"**

#### **Paso 2: Copia y Ejecuta este SQL**
```sql
-- Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Crear políticas correctas
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- Asegurar que el bucket es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'uploads';
```

#### **Paso 3: Verifica**
Ejecuta este query:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;
```

Deberías ver 4 políticas con nombres que terminan en "Access".

---

### **OPCIÓN 2: Deshabilitar RLS (Rápido pero menos seguro)**

Si la Opción 1 no funciona, prueba esto:

#### **En Supabase SQL Editor:**
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- O crear política permisiva
CREATE POLICY "Allow All Operations"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');
```

**⚠️ Advertencia:** Esto hace el storage más permisivo.

---

### **OPCIÓN 3: Configurar desde la UI de Supabase**

#### **Paso 1: Ve a Storage**
1. Supabase Dashboard → **Storage**
2. Click en bucket **"uploads"**

#### **Paso 2: Ve a Policies**
1. Click en pestaña **"Policies"** (arriba)
2. Verás las políticas existentes

#### **Paso 3: Elimina políticas conflictivas**
1. Si ves políticas existentes, elimínalas todas
2. Click en botón **"..."** → **"Delete policy"**

#### **Paso 4: Crea nuevas políticas**

**Política 1: Public Read**
- Click **"New Policy"**
- Template: **"Allow public read access"** (si está disponible)
- O manualmente:
  - Name: `Public Read Access`
  - Allowed operation: `SELECT`
  - Target roles: `public`
  - USING expression: `bucket_id = 'uploads'`
- Click **"Review"** → **"Save policy"**

**Política 2: Authenticated Upload**
- Click **"New Policy"**
- Name: `Authenticated Upload Access`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'uploads'`
- Click **"Save policy"**

**Política 3: Authenticated Update**
- Click **"New Policy"**
- Name: `Authenticated Update Access`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'uploads'`
- WITH CHECK expression: `bucket_id = 'uploads'`
- Click **"Save policy"**

**Política 4: Authenticated Delete**
- Click **"New Policy"**
- Name: `Authenticated Delete Access`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'uploads'`
- Click **"Save policy"**

---

## 🧪 Probar la Solución

### **Después de aplicar cualquier opción:**

1. **Ve a tu aplicación**:
   ```
   https://tu-dominio.com/admin/recursos
   ```

2. **Login como admin**

3. **Click "Nuevo Recurso"**

4. **Intenta subir una imagen**

5. **Verifica la consola del navegador** (F12):
   - Debería mostrar: `[UPLOAD] Upload successful`
   - Y luego: `[UPLOAD] Public URL: https://...`

---

## 📊 Verificar Estado Actual

### **Ejecuta este query en Supabase:**
```sql
-- Ver bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'uploads';

-- Ver políticas
SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;

-- Ver si RLS está activo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects';
```

**Resultado esperado:**
- Bucket `uploads` existe y `public = true`
- 4 políticas configuradas
- `rowsecurity = true` (si usaste Opción 1)

---

## 🔍 Troubleshooting

### **Error persiste después de Opción 1:**
- Prueba Opción 2 (deshabilitar RLS)
- O verifica que estés autenticado correctamente
- Revisa logs del navegador: `[UPLOAD]` messages

### **Error: "Bucket not found"**
- El bucket no existe
- Créalo: Storage → New bucket → Nombre: `uploads` → Public ✓

### **Error: "Invalid token"**
- Problema de autenticación
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté correcto en `.env`
- Reinicia frontend: `sudo supervisorctl restart frontend`

### **Error: "File too large"**
- Límite: 5MB
- Reduce el tamaño de la imagen

---

## 📝 Archivos Creados

1. `/app/SUPABASE_FIX_STORAGE_POLICIES.sql` - Script SQL completo
2. `/app/SUPABASE_DISABLE_RLS_STORAGE.sql` - Script para deshabilitar RLS
3. `/app/INSTRUCCIONES_UPLOAD_IMAGENES.md` - Este archivo

---

## ✅ Checklist

- [ ] Bucket `uploads` existe
- [ ] Bucket es público
- [ ] 4 políticas creadas (o RLS deshabilitado)
- [ ] Test de upload exitoso
- [ ] Imagen visible en blog

---

**Mi Recomendación:**
1. Prueba primero **Opción 1** (políticas correctas)
2. Si falla, usa **Opción 2** (deshabilitar RLS)
3. Una vez funcionando, puedes refinar las políticas

**Una vez configurado, el upload debería funcionar perfectamente** ✅
