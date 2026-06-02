# 🚀 CONFIGURACIÓN FINAL VERCEL - PostgreSQL + Supabase

## ✅ ESTADO ACTUAL:
- Build funciona ✅ (28/28 páginas)
- PostgreSQL schema ✅
- Vercel.json simplificado ✅
- Error handling mejorado ✅

## 🔧 VARIABLES DE ENTORNO PARA VERCEL:

**Copiar EXACTAMENTE estas variables en Vercel Dashboard → Settings → Environment Variables:**

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.asdybrboylsvtcvodvzn.supabase.co:5432/postgres

NEXTAUTH_SECRET=workhoops-secret-vercel-production-2024-32-chars-minimum-key

NEXTAUTH_URL=https://workhoops.com

APP_URL=https://workhoops.com

SUPPORT_EMAIL=support@workhoops.es

RESEND_API_KEY=re_CzmSmnWm_2MerkUrQ7Ka8zWwGtw9xRKDo

NEXT_PUBLIC_SUPABASE_URL=https://asdybrboylsvtcvodvzn.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvb3JwYW10ZXJ4bnF3aWxvbXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzE0MzIsImV4cCI6MjA3NTAwNzQzMn0.cPKKQeHalxPA_jD1YBA9c3IlrJC_-d1NYrfYD6UXLKo
```

## ⚠️ IMPORTANTE:
1. **Asegúrate de poner TU contraseña real** en DATABASE_URL
2. **Marca TODAS las variables para**: Production, Preview, Development
3. **Genera tu propio NEXTAUTH_SECRET** (mínimo 32 caracteres)

## 🎯 PASOS PARA DEPLOY:
1. Configurar variables en Vercel
2. Push estos cambios a main
3. Deploy automático se ejecutará
4. Ejecutar: `curl -X POST https://workhoops.com/api/init-db`