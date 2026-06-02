# Variables de Entorno para Vercel (SQLite Temporal)

Ve a Vercel Dashboard → Settings → Environment Variables

## CAMBIAR SOLO ESTA:
```
DATABASE_URL=file:./tmp/dev.db
```

## MANTENER ESTAS:
```
NEXTAUTH_SECRET=tu-secret-generado
NEXTAUTH_URL=https://workhoops.com
APP_URL=https://workhoops.com
SUPPORT_EMAIL=support@workhoops.es
RESEND_API_KEY=re_CzmSmnWm_2MerkUrQ7Ka8zWwGtw9xRKDo
```

## REMOVER TEMPORALMENTE (para simplificar):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY