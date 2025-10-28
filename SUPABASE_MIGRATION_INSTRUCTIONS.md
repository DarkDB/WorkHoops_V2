# Instrucciones para Aplicar Cambios en Supabase

## 📋 Orden de Ejecución

Sigue estos pasos **en este orden exacto** en el SQL Editor de Supabase:

### 1️⃣ Crear/Actualizar Tablas
**Archivo:** `SUPABASE_ADD_COACH_AND_CLUB_PROFILES.sql`

Este script:
- ✅ Crea la tabla `coach_profiles` (nueva)
- ✅ Actualiza la tabla `club_agency_profiles` con nuevos campos
- ✅ Crea índices para optimizar búsquedas
- ✅ Es idempotente (se puede ejecutar múltiples veces sin problemas)

**Cómo ejecutar:**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar todo el contenido de `SUPABASE_ADD_COACH_AND_CLUB_PROFILES.sql`
3. Pegar en el editor
4. Hacer clic en "Run"
5. Verificar que dice "Success" sin errores

---

### 2️⃣ Aplicar Políticas RLS
**Archivo:** `SUPABASE_RLS_POLICIES.sql`

Este script:
- ✅ Habilita Row Level Security en todas las tablas de perfiles
- ✅ Configura políticas para `talent_profiles`
- ✅ Configura políticas para `player_skills`
- ✅ Configura políticas para `coach_profiles`
- ✅ Configura políticas para `club_agency_profiles`
- ✅ Configura políticas para `interest_notifications`

**Cómo ejecutar:**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar todo el contenido de `SUPABASE_RLS_POLICIES.sql`
3. Pegar en el editor
4. Hacer clic en "Run"
5. Verificar que dice "Success" sin errores

---

## 🔐 Resumen de Políticas RLS

### Políticas Aplicadas:

**Para Perfiles Públicos (talent_profiles, coach_profiles, club_agency_profiles):**
- ✅ Cualquiera puede VER perfiles públicos
- ✅ Usuarios autenticados pueden VER todos los perfiles públicos
- ✅ Cada usuario puede VER, CREAR, ACTUALIZAR y ELIMINAR solo su propio perfil
- ✅ Los perfiles privados solo son visibles para su dueño

**Para Player Skills:**
- ✅ Las skills son visibles si el perfil es público
- ✅ Cada usuario puede gestionar solo sus propias skills

**Para Interest Notifications:**
- ✅ El dueño del perfil puede ver notificaciones recibidas
- ✅ El remitente puede ver las notificaciones que envió
- ✅ Solo usuarios autenticados pueden enviar notificaciones

---

## ✅ Verificación

Después de ejecutar ambos scripts, verifica:

1. **Tablas creadas:**
   - Ir a Table Editor
   - Verificar que existe `coach_profiles`
   - Verificar que `club_agency_profiles` tiene los nuevos campos

2. **RLS habilitado:**
   - Ir a Authentication → Policies
   - Verificar que todas las tablas tienen políticas activas
   - Deberías ver políticas para cada tabla mencionada

3. **Probar en la aplicación:**
   - Registrar un nuevo usuario
   - Intentar completar el perfil
   - Verificar que se guarda correctamente

---

## 🚨 Si Algo Falla

### Error: "column already exists"
- ✅ Esto es normal, el script es idempotente
- ✅ Continúa con la ejecución

### Error: "policy already exists"
- ✅ Elimina las políticas antiguas primero:
```sql
DROP POLICY IF EXISTS "nombre_politica" ON "nombre_tabla";
```
- ✅ Luego vuelve a ejecutar el script RLS

### Error: "table does not exist"
- ⚠️ Ejecuta primero el script de tablas
- ⚠️ Luego el script de RLS

---

## 📝 Notas Importantes

1. **Orden de ejecución:** Siempre tablas primero, RLS después
2. **Backup:** Supabase hace backups automáticos, pero puedes hacer uno manual antes
3. **Testing:** Prueba en ambiente de desarrollo primero si es posible
4. **Compatibilidad:** El código viejo sigue funcionando gracias al mapeo de compatibilidad

---

## 🔄 Migración de Datos Antiguos (Opcional)

Si tienes datos antiguos en `club_agency_profiles` con campos viejos:

```sql
-- Copiar organizationName a legalName si existe
UPDATE "club_agency_profiles" 
SET "legalName" = "organizationName" 
WHERE "legalName" IS NULL AND "organizationName" IS NOT NULL;

-- Copiar organizationType a entityType si existe
UPDATE "club_agency_profiles" 
SET "entityType" = "organizationType" 
WHERE "entityType" IS NULL AND "organizationType" IS NOT NULL;
```

---

## ✨ Resultado Esperado

Después de aplicar todo:
- ✅ 3 tipos de perfiles funcionando: Jugador, Entrenador, Club/Agencia
- ✅ Seguridad configurada con RLS
- ✅ Sistema de onboarding completo
- ✅ API endpoints listos para usar

---

**Fecha de creación:** 28 de Octubre 2024  
**Versión:** 1.0
