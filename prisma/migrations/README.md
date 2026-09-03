# Migraciones de Prisma

`0_production_baseline` es el baseline canónico del schema de Production
capturado el 2 de septiembre de 2026. Sustituye a `0_init`, archivada en
`docs/migrations/legacy/0_init.sql` por no representar la base real.

## Production existente

Production ya contiene las tablas, enums, índices y políticas del baseline, pero
no tiene `_prisma_migrations`. Cuando se autorice el baseline, debe registrarse
**sin ejecutar su SQL**:

```bash
DATABASE_URL="<URL directa de Production>" yarn prisma migrate resolve --applied 0_production_baseline
```

Después, comprueba el estado y aplica únicamente migraciones posteriores:

```bash
DATABASE_URL="<URL directa de Production>" yarn prisma migrate status
DATABASE_URL="<URL directa de Production>" yarn prisma migrate deploy
```

No ejecutes `migrate deploy` hasta que el baseline esté marcado como aplicado y
la siguiente migración haya sido revisada.

## Base de datos nueva en Supabase

En un proyecto nuevo de Supabase, una vez que Supabase haya provisionado sus
roles y esquema `auth`, `migrate deploy` ejecuta el baseline y después todas las
migraciones posteriores:

```bash
DATABASE_URL="<URL de la base nueva>" yarn prisma migrate deploy
```

El baseline replica las políticas RLS de Production y depende de los roles
`anon`/`authenticated` y de `auth.uid()` que provee Supabase. No es un bootstrap
autónomo para PostgreSQL vanilla sin esos prerrequisitos.

## Reglas

- No usar `prisma db push` contra Production.
- No editar una migración que ya haya sido aplicada.
- Crear cada cambio de schema como una migración nueva sobre el baseline.
- El baseline incluye SQL complementario para `pgcrypto`, RLS y políticas porque
  Prisma Migrate no los genera automáticamente.
