# 🏀 WorkHoops - Plataforma de Oportunidades de Baloncesto

Una plataforma moderna que conecta el talento del baloncesto español con oportunidades profesionales.

## ✨ Características

- **🔐 Autenticación completa** con NextAuth.js  
- **📊 Dashboard personalizado** por rol de usuario
- **📝 Sistema de aplicaciones** para oportunidades
- **❤️ Gestión de favoritos** y notificaciones
- **📄 Páginas legales** (RGPD compliant)
- **📱 Diseño responsive** con Tailwind CSS y Shadcn UI
- **🗄️ Base de datos** con Prisma ORM

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI  
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase) / SQLite (desarrollo)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Email**: Resend
- **Payments**: Stripe

## ⚡ Setup Rápido para Desarrollo Local

```bash
# 1. Clonar e instalar
git clone <tu-repo>
cd workhoops
npm install

# 2. Setup completo (automático)
npm run setup

# 3. Iniciar desarrollo
npm run dev
```

🎉 **¡Ya está!** Visita `http://localhost:3000`

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | 🔥 Servidor de desarrollo |
| `npm run build` | 📦 Build para producción |
| `npm run setup` | ⚙️ Setup completo (Prisma + DB + datos) |
| `npm run db:generate` | 🔧 Generar cliente Prisma |
| `npm run db:push` | 📤 Push esquema a BD |
| `npm run db:seed` | 🌱 Poblar con datos de prueba |
| `npm run db:studio` | 🎨 Abrir Prisma Studio |

## 🔧 Configuración (Opcional)

El proyecto funciona out-of-the-box, pero puedes personalizar creando `.env`:

```env
# Base de datos (automático en desarrollo)
DATABASE_URL="file:./dev.db"

# NextAuth (generado automáticamente)
NEXTAUTH_SECRET="workhoops-secret-key-min-32-chars-long-2024"
NEXTAUTH_URL="http://localhost:3000"

# App settings
APP_URL="http://localhost:3000"
SUPPORT_EMAIL="support@workhoops.es"
```

## 🚀 Deploy en Producción

**Status actual**: ✅ **Listo para deploy en Vercel**

```bash
# Build funciona sin errores
npm run build

# Ver instrucciones completas
cat PRODUCTION_CHECKLIST.md
```

### Deploy en Vercel:
1. Push a GitHub
2. Conectar repo a Vercel  
3. Variables de entorno (ver `DEPLOYMENT.md`)
4. Deploy automático

## 🐛 Solución de Problemas

### Error de Prisma Client
```bash
npm run db:generate
```

### Error de build
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Base de datos corrupta
```bash
rm prisma/dev.db
npm run setup
```

## 📚 Documentación Adicional

- **Deploy**: `DEPLOYMENT.md` 
- **Supabase**: `SUPABASE_SETUP.md`
- **Producción**: `PRODUCTION_CHECKLIST.md`

---

**¿Problemas?** Abre un issue o consulta la documentación 📖
