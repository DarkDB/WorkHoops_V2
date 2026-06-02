# 🎯 Solución Simple por Interfaz (Sin SQL)

## ✅ Pasos en la UI de Supabase

### **Paso 1: Ve a Storage**
1. https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **Storage** (menú lateral izquierdo)

### **Paso 2: Click en el bucket "uploads"**
- Deberías verlo en la lista de buckets
- Si no existe, créalo primero (New bucket → nombre: `uploads` → Public ✓)

### **Paso 3: Ve a Configuration**
1. Con el bucket `uploads` seleccionado
2. Click en **Configuration** (pestaña arriba)
3. Busca la opción **"Public bucket"**
4. **Actívala** si no está activa (toggle ON)
5. Click **Save**

### **Paso 4: Ve a Policies**
1. Click en pestaña **Policies** (al lado de Configuration)
2. **Elimina TODAS las políticas existentes**:
   - Si ves políticas listadas, click en "..." → Delete
   - Elimina todas una por una

### **Paso 5: Crear Nueva Política Simple**
1. Click en **"New Policy"**
2. Selecciona **"For full customization"** (abajo)
3. Completa el formulario:

**Campo por campo:**
```
Policy name: uploads_full_access

Target roles: 
☑ public
☑ authenticated  
☑ anon

Allowed operations:
☑ SELECT
☑ INSERT
☑ UPDATE
☑ DELETE

Policy definition for SELECT:
bucket_id = 'uploads'

Policy definition for INSERT:
bucket_id = 'uploads'

Policy definition for UPDATE:
bucket_id = 'uploads'

Policy definition for DELETE:
bucket_id = 'uploads'
```

4. Click **Review**
5. Click **Save policy**

### **Paso 6: Verificar**
- Deberías ver 1 política llamada `uploads_full_access`
- El bucket debería estar marcado como **Public**

---

## 🧪 Probar Upload

1. Ve a tu app: `/admin/recursos`
2. Click "Nuevo Recurso"
3. Intenta subir una imagen
4. Debería funcionar ✅

---

## 📸 Visual Guide

### Lo que deberías ver en Policies:
```
Policy Name: uploads_full_access
Roles: public, authenticated, anon
Operations: ALL
Status: Active
```

### Lo que deberías ver en Configuration:
```
Bucket ID: uploads
Public: ✓ Yes
File size limit: 50MB (default)
```

---

## ⚠️ Si aún no funciona

### **Opción A: Política más simple desde SQL**
1. Ve a **SQL Editor**
2. Ejecuta:
```sql
-- Eliminar todas las políticas
DELETE FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%upload%';

-- Crear política super simple
CREATE POLICY "uploads_full_access"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');
```

### **Opción B: Contactar soporte de Supabase**
Si nada funciona, puede ser un problema de permisos del proyecto.

---

## ✅ Checklist Final

- [ ] Bucket `uploads` existe
- [ ] Bucket es público (toggle ON)
- [ ] Todas las políticas antiguas eliminadas
- [ ] 1 nueva política `uploads_full_access` creada
- [ ] Política tiene roles: public, authenticated, anon
- [ ] Política permite: SELECT, INSERT, UPDATE, DELETE
- [ ] Test de upload exitoso

---

**Esta solución es la más simple y debería funcionar** ✅
