# 🗂️ Configuración de Supabase Storage para Upload de Imágenes

## ❌ Problema
Error 500 al subir imágenes en el blog de recursos.

## ✅ Solución

### **Paso 1: Verificar/Crear Bucket en Supabase**

1. **Ve a Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecciona tu proyecto WorkHoops

2. **Ve a Storage**:
   - En el menú lateral, click en **Storage**

3. **Verifica si existe el bucket `uploads`**:
   - Si existe → Ve al Paso 2
   - Si NO existe → Continúa abajo

4. **Crear bucket `uploads`** (si no existe):
   - Click en **"New bucket"**
   - Nombre: `uploads`
   - **IMPORTANTE**: Marca como **"Public bucket"** ✓
   - Click en **"Create bucket"**

### **Paso 2: Configurar Permisos (RLS Policies)**

1. **Click en el bucket `uploads`**

2. **Ve a "Policies"** (pestaña arriba)

3. **Agregar política de lectura pública**:
   - Click en **"New Policy"**
   - Selecciona **"For full customization"**
   - Completa:
     - **Policy name**: `Public Read`
     - **Allowed operation**: `SELECT`
     - **Target roles**: `public`
     - **USING expression**: `true`
   - Click **"Save"**

4. **Agregar política de escritura para usuarios autenticados**:
   - Click en **"New Policy"** nuevamente
   - Completa:
     - **Policy name**: `Authenticated Upload`
     - **Allowed operation**: `INSERT`
     - **Target roles**: `authenticated`
     - **USING expression**: `true`
   - Click **"Save"**

5. **Agregar política de actualización para usuarios autenticados**:
   - Click en **"New Policy"**
   - Completa:
     - **Policy name**: `Authenticated Update`
     - **Allowed operation**: `UPDATE`
     - **Target roles**: `authenticated`
     - **USING expression**: `true`
   - Click **"Save"**

6. **Agregar política de eliminación para usuarios autenticados**:
   - Click en **"New Policy"**
   - Completa:
     - **Policy name**: `Authenticated Delete`
     - **Allowed operation**: `DELETE`
     - **Target roles**: `authenticated`
     - **USING expression**: `true`
   - Click **"Save"**

### **Paso 3: Verificar Configuración**

1. **Verifica que el bucket es público**:
   - Ve a Storage → `uploads`
   - Debería decir "Public" junto al nombre

2. **Verifica las políticas**:
   - Deberías ver 4 políticas:
     - Public Read
     - Authenticated Upload
     - Authenticated Update
     - Authenticated Delete

### **Paso 4: Probar Upload**

1. **Ve a tu aplicación**:
   - Login como admin
   - Ve a `/admin/recursos`
   - Click "Nuevo Recurso"
   - Intenta subir una imagen

2. **Debería funcionar** ✓

---

## 🔧 Script SQL Alternativo (Opcional)

Si prefieres hacerlo por SQL, ejecuta esto en Supabase SQL Editor:

```sql
-- Crear bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política de lectura pública
CREATE POLICY "Public Read" ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- Política de escritura autenticada
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Política de actualización autenticada
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

-- Política de eliminación autenticada
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
```

---

## 🎯 Estructura del Bucket

Después de subir imágenes, la estructura será:

```
uploads/
└── resources/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.png
    └── ...
```

---

## ✅ Checklist

- [ ] Bucket `uploads` creado
- [ ] Bucket marcado como público
- [ ] Política "Public Read" creada
- [ ] Política "Authenticated Upload" creada
- [ ] Política "Authenticated Update" creada
- [ ] Política "Authenticated Delete" creada
- [ ] Test de upload exitoso

---

## 🐛 Troubleshooting

### **Error: "new row violates row-level security policy"**
- Solución: Verifica que las políticas estén creadas correctamente
- Verifica que el usuario esté autenticado

### **Error: "Bucket not found"**
- Solución: Crea el bucket `uploads` con el nombre exacto

### **Error: "Error Supabase"**
- Solución: Revisa los logs del navegador
- Verifica las variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Error 403: Forbidden**
- Solución: El bucket no es público
- Ve a Storage → uploads → Configuration → Make public

---

## 📝 Notas

- **Tamaño máximo**: 5MB por imagen
- **Formatos aceptados**: JPG, PNG, WEBP
- **Carpeta**: Todas las imágenes de recursos van a `resources/`
- **Nombres**: Auto-generados con timestamp + random
- **URLs públicas**: Se generan automáticamente

---

**Fecha**: Diciembre 2024  
**Estado**: Pendiente de configuración
