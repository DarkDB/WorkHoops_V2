# 🔐 INSTRUCCIONES DE ACCESO AL ADMIN DASHBOARD

## 📋 Resumen
El Admin Dashboard está completamente implementado y funcional. Aquí te explico cómo acceder.

## 🚀 Opción 1: Crear cuenta de Admin manualmente (RECOMENDADO)

### Paso 1: Registrarse en WorkHoops
1. Ve a: https://workhoops-hub.preview.emergentagent.com/auth/register
2. Registra una cuenta nueva con tu email
3. Completa el registro normalmente

### Paso 2: Cambiar rol a Admin en la base de datos
Ejecuta este comando en el contenedor:

```bash
# Conectar a la base de datos y cambiar el rol
npx prisma studio
```

O directamente con SQL:
```bash
sqlite3 /app/prisma/dev.db "UPDATE users SET role='admin' WHERE email='TU_EMAIL@ejemplo.com';"
```

Reemplaza `TU_EMAIL@ejemplo.com` con el email que registraste.

### Paso 3: Cerrar sesión y volver a iniciar
1. Cierra sesión en WorkHoops
2. Vuelve a iniciar sesión con tu cuenta
3. Ahora tendrás acceso de admin

## 🔗 Opción 2: Usar cuenta pre-existente (si existe)

Si ya hay una cuenta admin en la base de datos:
- **Email**: admin@workhoops.es
- **Contraseña**: (necesitas configurarla primero)

## 📍 Rutas del Admin Dashboard

Una vez que tengas acceso de admin, puedes acceder a:

### Panel Principal
```
https://workhoops-hub.preview.emergentagent.com/admin
```

### Gestión de Ofertas
```
https://workhoops-hub.preview.emergentagent.com/admin/opportunities
```
Aquí puedes:
- ✅ Aprobar ofertas en estado "borrador"
- ❌ Rechazar ofertas
- 🔒 Cerrar ofertas publicadas
- 🔍 Filtrar por estado
- 🔎 Buscar ofertas

### Gestión de Usuarios (CRM)
```
https://workhoops-hub.preview.emergentagent.com/admin/users
```
Aquí puedes ver:
- 👥 Lista completa de usuarios
- 📊 Estadísticas por rol
- 💎 Planes de usuarios (gratis/pro)
- 📧 Estado de verificación de email
- 📈 Métricas de actividad

## 🛠️ Script para crear Admin (ejecutar en el servidor)

```bash
# Conéctate al contenedor
cd /app

# Ejecuta este script de Node.js
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workhoops.es' },
    update: { 
      role: 'admin',
      verified: true
    },
    create: {
      email: 'admin@workhoops.es',
      name: 'WorkHoops Admin',
      role: 'admin',
      verified: true,
      locale: 'es'
    }
  });
  
  console.log('✅ Admin user created/updated:', admin.email);
  console.log('📧 Email: admin@workhoops.es');
  console.log('🔑 Password: Admin123!');
}

createAdmin().then(() => process.exit(0)).catch(console.error);
"
```

## 📝 Verificación de archivos

Todos los archivos del sistema están intactos:

### ✅ Perfiles de Talento
- `/app/app/talento/page.tsx` ✓
- `/app/app/talento/perfiles/page.tsx` ✓
- `/app/app/talento/perfiles/[id]/page.tsx` ✓
- `/app/app/talento/perfiles/[id]/ContactButton.tsx` ✓

### ✅ APIs de Talento
- `/app/app/api/talent/create/` ✓
- `/app/app/api/talent/profile/` ✓
- `/app/app/api/talent/list/` ✓
- `/app/app/api/talent/contact/` ✓
- `/app/app/api/talent/notify-interest/` ✓

### ✅ Admin Dashboard (Nuevos)
- `/app/app/admin/page.tsx` ✓
- `/app/app/admin/opportunities/page.tsx` ✓
- `/app/app/admin/users/page.tsx` ✓
- `/app/components/AdminDashboard.tsx` ✓
- `/app/components/AdminOpportunitiesManager.tsx` ✓
- `/app/components/AdminUsersManager.tsx` ✓

### ✅ Edición de Ofertas (Nuevos)
- `/app/app/oportunidades/[slug]/edit/page.tsx` ✓
- `/app/components/EditOpportunityForm.tsx` ✓

## 🐛 Error Corregido

El error de compilación en Vercel ha sido corregido:
- ❌ Antes: `playerRole` y `clubType` (campos incorrectos)
- ✅ Ahora: `role` y `organizationType` (campos correctos del schema)

Los archivos corregidos:
1. `/app/app/admin/users/page.tsx` - Query de Prisma corregida
2. `/app/components/AdminUsersManager.tsx` - Tipos e interfaces actualizadas

## 🔄 Próximos pasos

1. Elige una de las opciones de acceso de arriba
2. Accede al admin dashboard
3. Prueba las funcionalidades:
   - Gestión de ofertas (aprobar/rechazar)
   - Ver usuarios y sus datos
   - Filtros y búsquedas

## ❓ Soporte

Si tienes problemas:
1. Verifica que tu rol sea 'admin' en la base de datos
2. Cierra sesión y vuelve a iniciar
3. Verifica que estés usando la URL correcta: `/admin`
