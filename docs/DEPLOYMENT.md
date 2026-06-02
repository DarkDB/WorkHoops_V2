# 🚀 WorkHoops Deployment Guide

## Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto llamado "workhoops"
3. Ve a Settings > Database y copia:
   - `DATABASE_URL` (Connection string)
   - `SUPABASE_URL` 
   - `SUPABASE_ANON_KEY`

## Paso 2: Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Importa el repositorio de WorkHoops
3. Configura las siguientes variables de entorno:

### Variables Obligatorias:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=tu-secreto-super-largo-minimo-32-caracteres
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### Variables Opcionales (para más adelante):
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

## Paso 3: Deploy y Configurar Base de Datos

1. Haz el primer deploy en Vercel
2. Una vez deployado, ejecuta la migración:

```bash
# En tu terminal local:
npx prisma migrate deploy
npx prisma db seed
```

## Paso 4: Probar la Aplicación

1. Ve a tu URL de Vercel
2. Prueba el registro: `/auth/register`
3. Prueba el login con usuarios de prueba:
   - `admin@workhoops.es`
   - `jugador@ejemplo.es`
   - `club@fcbarcelona.es`

## Comandos Útiles

```bash
# Generar cliente Prisma
npx prisma generate

# Ver base de datos
npx prisma studio

# Reset completo (¡CUIDADO!)
npx prisma migrate reset
```

## 🔧 Troubleshooting

### Error de conexión a BD:
- Verifica que DATABASE_URL esté correcta
- Asegúrate que Supabase esté activo

### Error de build:
- Verifica que todas las dependencias estén en package.json
- Revisa los logs de Vercel

### Error de NextAuth:
- Verifica NEXTAUTH_SECRET (mínimo 32 caracteres)
- Verifica NEXTAUTH_URL apunte a tu dominio de Vercel

## 🎯 Próximos Pasos

1. ✅ Configurar dominio personalizado
2. ✅ Configurar emails con Resend
3. ✅ Configurar pagos con Stripe
4. ✅ Configurar almacenamiento de archivos