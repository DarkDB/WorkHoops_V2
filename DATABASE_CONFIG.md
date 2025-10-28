# Configuración de Base de Datos - WorkHoops

## ⚠️ IMPORTANTE: Solo PostgreSQL

Esta aplicación usa **EXCLUSIVAMENTE PostgreSQL** a través de Supabase.

### Base de Datos en Uso

**Proveedor:** Supabase (PostgreSQL)
**URL de Conexión:** Configurada en `.env` como `DATABASE_URL`

```
DATABASE_URL="postgresql://postgres:Edu239108%21@db.asdybrboylsvtcvodvzn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Schema de Prisma

**Archivo activo:** `/app/prisma/schema.prisma`
**Provider:** `postgresql`

Este schema incluye:
- Enums nativos de PostgreSQL (UserRole, OpportunityType, etc.)
- Modelos completos: User, TalentProfile, PlayerSkills, ClubAgencyProfile, Opportunity, Application, etc.
- Relaciones complejas entre modelos

### Migraciones

Para aplicar cambios en producción (Supabase):
1. Modificar `prisma/schema.prisma`
2. Ejecutar `npx prisma generate` para regenerar el cliente
3. Aplicar los cambios SQL manualmente en Supabase SQL Editor (archivos `.sql` en raíz del proyecto)

### Archivos SQL de Migración

- `SUPABASE_SETUP_CORRECTED.sql` - Setup inicial completo
- `SUPABASE_ADD_MISSING_TABLES.sql` - Tablas adicionales
- `SUPABASE_UPDATE_TALENT_PROFILE.sql` - Schema mejorado de perfiles
- `SUPABASE_ADD_INTEREST_NOTIFICATIONS.sql` - Sistema de notificaciones
- `SUPABASE_ENABLE_RLS.sql` - Row Level Security (pendiente activar)

### ❌ NO Usar SQLite

SQLite fue usado inicialmente para desarrollo local pero causó problemas:
- No soporta enums nativos
- Incompatibilidades de schema con PostgreSQL
- Confusión entre entornos

**Archivos archivados en `/app/prisma/_archived/`:**
- `dev.db` (base de datos SQLite antigua)
- `schema-sqlite.prisma` (schema antiguo)
- `schema-postgresql-backup.prisma` (backup antiguo)

### Comandos Útiles

```bash
# Regenerar cliente de Prisma (después de cambios en schema)
npx prisma generate

# Ver el schema actual de la base de datos
npx prisma db pull

# Formatear el schema
npx prisma format

# Abrir Prisma Studio (GUI para ver datos)
npx prisma studio
```

### Acceso a Supabase

- **Dashboard:** https://supabase.com/dashboard
- **Proyecto:** WorkHoops
- **SQL Editor:** Para ejecutar migraciones manualmente

### Notas Importantes

1. **Siempre usa PostgreSQL:** El schema está optimizado para PostgreSQL con enums, arrays, y tipos específicos
2. **PgBouncer:** La URL usa PgBouncer (puerto 6543) para connection pooling
3. **Migraciones manuales:** Los cambios se aplican manualmente en Supabase SQL Editor
4. **Sincronizar schema:** Después de cambios en Supabase, actualiza `schema.prisma` para reflejar la estructura real

---

**Última actualización:** 27 de Octubre, 2024
**Configurado para:** Solo PostgreSQL (Supabase)
