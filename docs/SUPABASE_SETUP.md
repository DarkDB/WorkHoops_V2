# 🗄️ Configuración de Supabase para WorkHoops

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Clic en "Start your project"
3. Crea una cuenta si no tienes una
4. Clic en "New Project"
5. Configuración del proyecto:
   - **Name**: `workhoops`
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Europe West (London) - para mejor latencia en España
   - **Plan**: Free (suficiente para empezar)

## Paso 2: Obtener Credenciales

Una vez creado el proyecto (toma 1-2 minutos):

1. Ve a **Settings** > **Database**
2. Copia la **Connection string** (URI):
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
   
3. Ve a **Settings** > **API** 
4. Copia:
   - **Project URL**: `https://xxx.supabase.co`
   - **Project API Keys** > **anon public**: `eyJhbGc...`

## Paso 3: Variables de Entorno

Tendrás estas variables para usar en Vercel:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Paso 4: Configurar Autenticación (Opcional)

Si quieres usar autenticación de Supabase en lugar de NextAuth:

1. Ve a **Authentication** > **Settings**
2. En **Site URL** pon tu dominio de producción
3. En **Redirect URLs** añade:
   - `https://tu-dominio.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (para desarrollo)

## 🎯 ¡Listo para el siguiente paso!

Una vez tengas estas credenciales, podemos continuar con Vercel.