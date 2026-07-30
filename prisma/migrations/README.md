# Migraciones de Prisma

Este proyecto usa `prisma migrate` con PostgreSQL (Supabase). La migración `0_init`
es la **baseline**: representa el estado completo del schema en el momento de adoptar
migraciones versionadas (julio 2026). Las migraciones parciales anteriores están
archivadas en `docs/sql-legacy/applied-migrations/`.

## Puesta en marcha (una sola vez, contra producción)

La base de datos de producción ya tiene todas las tablas, así que hay que marcar la
baseline como aplicada SIN ejecutarla:

```bash
DATABASE_URL="<url de producción>" npx prisma migrate resolve --applied 0_init
```

Esto solo inserta un registro en la tabla `_prisma_migrations`. No toca ningún dato.

## Flujo de trabajo a partir de ahora

1. Editar `prisma/schema.prisma`.
2. Generar la migración contra una BD de desarrollo:
   ```bash
   npx prisma migrate dev --name descripcion_del_cambio
   ```
3. Commitear la carpeta de migración generada junto con el cambio de schema.
4. Aplicar en producción (idealmente en el build de Vercel o a mano):
   ```bash
   npx prisma migrate deploy
   ```

## Reglas

- **No usar `prisma db push` contra producción.** Es la causa histórica de las
  desincronizaciones entre schema y BD real.
- No editar migraciones ya aplicadas; crear una nueva.
- No ejecutar SQL a mano en Supabase para cambios de schema; siempre vía migración.
