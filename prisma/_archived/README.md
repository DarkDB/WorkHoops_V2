# Archivos Archivados - No Usar

Esta carpeta contiene archivos de configuración antiguos que **NO DEBEN USARSE**.

## Archivos:

### Base de Datos SQLite (Obsoletos)
- `dev.db` - Base de datos SQLite local (ya no se usa)

### Schemas de Prisma (Obsoletos)
- `schema-sqlite.prisma` - Schema para SQLite (incompatible con enums)
- `schema-postgresql-backup.prisma` - Backup antiguo
- `schema-postgresql.prisma` - Versión antigua
- `schema.production.prisma` - Versión antigua

## ⚠️ Importante

**Solo usar:** `/app/prisma/schema.prisma`

Este es el único schema activo y está configurado para PostgreSQL (Supabase).

Todos los archivos en esta carpeta se mantienen únicamente como referencia histórica y no deben ser modificados ni utilizados en el desarrollo.

---
**Fecha de archivo:** 28 de Octubre, 2024
**Razón:** Consolidación a PostgreSQL exclusivamente
