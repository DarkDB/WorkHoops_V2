# 🧹 Instrucciones para Limpiar Datos de Prueba en WorkHoops

## ✅ Objetivo
Eliminar todos los datos de prueba (perfiles, oportunidades, aplicaciones, usuarios) **EXCEPTO** el usuario administrador (admin@workhoops.com).

---

## 📋 Pasos a Seguir

### **PASO 1: Verificar Datos Actuales (Opcional pero Recomendado)**

1. Ve a **Supabase Studio**: https://supabase.com/dashboard
2. Selecciona tu proyecto de WorkHoops
3. En el menú lateral, click en **SQL Editor**
4. Click en **New Query**
5. Abre el archivo: `/app/CHECK_DATABASE_BEFORE_CLEANUP.sql`
6. Copia TODO el contenido
7. Pégalo en el SQL Editor
8. Click en **RUN** (botón verde)
9. Revisa los resultados para ver qué datos tienes

**Esto te mostrará:**
- Todos los usuarios
- Todas las oportunidades
- Todos los perfiles (jugadores, coaches, clubs)
- Todas las aplicaciones
- Resumen de conteos

---

### **PASO 2: Ejecutar Script de Limpieza**

⚠️ **IMPORTANTE: Este proceso NO es reversible una vez que hagas COMMIT**

1. En Supabase Studio, SQL Editor
2. Click en **New Query** (nueva consulta)
3. Abre el archivo: `/app/CLEANUP_TEST_DATA_KEEP_ADMIN.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor
6. **LEE los comentarios del script** para entender qué hará
7. Click en **RUN** (botón verde)
8. Observa los mensajes de log en la parte inferior

---

### **PASO 3: Verificar Resultados**

Después de ejecutar, verás mensajes como:

```
Eliminadas X aplicaciones
Eliminadas X PlayerSkills
Eliminados X perfiles de talento (jugadores)
Eliminados X perfiles de coach (entrenadores)
Eliminados X perfiles de club/agencia
Eliminadas X oportunidades
Eliminadas X notificaciones de interés
Eliminados X usuarios (preservado admin@workhoops.com)
Usuario admin preservado con ID: clxxxx...

========================================
RESUMEN DE LIMPIEZA COMPLETADA:
========================================
Usuarios restantes: 1 (debería ser 1 - admin)
Oportunidades restantes: 0 (debería ser 0)
Aplicaciones restantes: 0 (debería ser 0)
Perfiles de talento restantes: 0 (debería ser 0)
Perfiles de coach restantes: 0 (debería ser 0)
Perfiles de club restantes: 0 (debería ser 0)
Admin preservado: SÍ ✓
========================================
```

---

### **PASO 4: Verificar en la Aplicación**

1. Ve a tu aplicación: https://workhoops-club.preview.emergentagent.com
2. Inicia sesión con el usuario admin (si no estás ya)
3. Verifica:
   - **Oportunidades**: `/oportunidades` → Debería estar vacío
   - **Perfiles**: `/talento/perfiles` → Debería estar vacío
   - **Clubes**: `/clubes` → Debería estar vacío
   - **Dashboard Admin**: Verifica que puedes acceder

---

## 🔒 Seguridad del Script

El script tiene **múltiples capas de seguridad**:

1. ✅ **Transacción**: Todo se ejecuta en una transacción `BEGIN...COMMIT`
2. ✅ **Verificación de admin**: Comprueba que admin@workhoops.com existe antes de eliminar
3. ✅ **Exclusión explícita**: Solo elimina usuarios donde `email != 'admin@workhoops.com'`
4. ✅ **Verificación final**: Al final verifica que el admin sigue existiendo
5. ✅ **Rollback automático**: Si el admin no existe después, hace ROLLBACK automático

---

## ⚠️ ¿Qué se Elimina?

El script elimina en este orden:

1. **Aplicaciones** → Todas las aplicaciones a oportunidades
2. **PlayerSkills** → Habilidades de jugadores
3. **TalentProfile** → Perfiles de jugadores
4. **CoachProfile** → Perfiles de entrenadores
5. **ClubAgencyProfile** → Perfiles de clubs/agencias
6. **Opportunity** → Todas las oportunidades publicadas
7. **InterestNotification** → Notificaciones de interés
8. **User** → Todos los usuarios **EXCEPTO admin@workhoops.com**

---

## 🛡️ ¿Qué se PRESERVA?

- ✅ Usuario con email `admin@workhoops.com`
- ✅ Su rol de admin
- ✅ Sus datos de perfil
- ✅ Estructura de la base de datos (tablas, columnas, relaciones)

---

## 🔄 Si Algo Sale Mal

### Opción 1: Rollback (ANTES de hacer COMMIT)
Si después de ejecutar el script ves algo raro en los mensajes, **NO hagas COMMIT**.
En su lugar, ejecuta:
```sql
ROLLBACK;
```

Esto deshará TODOS los cambios y volverás al estado anterior.

### Opción 2: Restaurar desde Backup (DESPUÉS de COMMIT)
Si ya hiciste COMMIT y quieres revertir:
1. Ve a Supabase Dashboard
2. Settings → Database → Backups
3. Restaura el backup más reciente

---

## 📊 Datos Después de la Limpieza

Después de limpiar, tu base de datos tendrá:

| Tabla | Cantidad |
|-------|----------|
| User | 1 (solo admin) |
| Opportunity | 0 |
| Application | 0 |
| TalentProfile | 0 |
| CoachProfile | 0 |
| ClubAgencyProfile | 0 |
| InterestNotification | 0 |
| PlayerSkills | 0 |

**Base de datos limpia y lista para producción** 🎉

---

## ❓ Preguntas Frecuentes

### ¿Puedo ejecutar el script varias veces?
Sí, es seguro ejecutarlo múltiples veces. Si ya no hay datos, simplemente mostrará "Eliminadas 0..."

### ¿Perderé las configuraciones de Stripe?
No. Las configuraciones de Stripe están en variables de entorno, no en la base de datos.

### ¿Se eliminarán las tablas?
No. Solo se eliminan los datos (filas), la estructura de la base de datos (tablas, columnas) permanece intacta.

### ¿Puedo eliminar solo algunas cosas?
Sí. Puedes comentar (agregar `--` al inicio) las secciones del script que NO quieras ejecutar.

Por ejemplo, para NO eliminar oportunidades:
```sql
-- =========================================
-- PASO 6: Eliminar todas las oportunidades
-- =========================================
-- DO $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM "Opportunity";
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RAISE NOTICE 'Eliminadas % oportunidades', deleted_count;
-- END $$;
```

---

## 📞 Soporte

Si tienes algún problema:
1. Revisa los mensajes de log en Supabase
2. Verifica que el admin sigue existiendo
3. Pregunta en el chat si necesitas ayuda

---

**Creado**: Diciembre 2024  
**Última actualización**: Diciembre 2024  
**Versión**: 1.0
