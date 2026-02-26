# 🔐 IMPLEMENTACIÓN DE SEGURIDAD COMPLETADA - WorkHoops

## Resumen de Cambios

### ✅ Archivos Creados/Modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `prisma/schema.prisma` | Modificado | Añadidos campos de seguridad + modelo OtpToken |
| `lib/auth.ts` | Reescrito | Login seguro con bcrypt + OTP + brute force protection |
| `lib/prisma.ts` | Reescrito | Logging condicional (solo errores en producción) |
| `lib/access.ts` | **NUEVO** | Helpers centralizados de permisos |
| `lib/email.ts` | Modificado | Añadida función `sendOtpEmail` |
| `middleware.ts` | **NUEVO** | Protección global de rutas |
| `app/api/auth/register/route.ts` | Reescrito | Rate limiting + bcrypt hash + sin backdoor |
| `app/api/auth/request-otp/route.ts` | **NUEVO** | Endpoint para solicitar OTP |
| `app/api/auth/set-password/route.ts` | **NUEVO** | Endpoint para establecer contraseña |
| `app/auth/otp/page.tsx` | **NUEVO** | UI para login con OTP |
| `app/auth/set-password/page.tsx` | **NUEVO** | UI para establecer contraseña |
| `app/auth/login/page.tsx` | Modificado | Añadido link a OTP |
| `scripts/set-admin-password.ts` | **NUEVO** | Script para establecer password de admin |
| `MIGRATION_SECURITY_FIELDS.sql` | **NUEVO** | SQL para migración de BD |

---

## 🚀 PASOS PARA DESPLEGAR

### Paso 1: Ejecutar SQL en Supabase

Abre el **SQL Editor** en tu dashboard de Supabase y ejecuta el contenido de:
```
/app/MIGRATION_SECURITY_FIELDS.sql
```

Este script:
- Añade columnas de seguridad a la tabla `users`
- Crea la tabla `otp_tokens`
- Marca usuarios existentes sin password para migración OTP

### Paso 2: Establecer Password del Admin

Ejecuta en la terminal:
```bash
cd /app
ADMIN_NEW_PASSWORD="TuPasswordSeguro123" npx tsx scripts/set-admin-password.ts
```

**Requisitos del password:**
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

### Paso 3: Desplegar en Vercel

```bash
# El build ya está listo
git add .
git commit -m "feat: implement secure auth with OTP migration"
# Push via Vercel dashboard o "Save to Github"
```

---

## 📋 FLUJOS DE USUARIO

### Flujo 1: Usuario Nuevo (Registro)
```
/auth/register → Crea cuenta con password → Login normal → Dashboard
```

### Flujo 2: Usuario Legacy (Sin Password)
```
/auth/login → Click "Accede con código" → /auth/otp
→ Introduce email → Recibe OTP por email
→ Introduce código 6 dígitos → Login
→ Redirect a /auth/set-password → Crea password
→ Dashboard (ya puede hacer login normal)
```

### Flujo 3: Admin
```
Ejecutar script set-admin-password.ts → Login normal en /auth/login
```

---

## 🔒 CARACTERÍSTICAS DE SEGURIDAD

| Característica | Implementación |
|----------------|----------------|
| Hash de password | bcrypt con factor 12 |
| Protección brute force | Bloqueo 15 min tras 5 intentos |
| Rate limiting registro | 5 por minuto por IP |
| Rate limiting OTP | 5 por minuto por IP |
| Anti-enumeración | Mensajes genéricos |
| OTP expiry | 10 minutos |
| Middleware protección | /dashboard, /profile, /publicar, /admin |
| Headers seguridad | X-Frame-Options, X-XSS-Protection, etc. |
| Logging producción | Solo errores |

---

## 🧪 TESTS MANUALES RECOMENDADOS

### 1. Login Admin
```bash
# Después de ejecutar set-admin-password.ts
curl -X POST https://tu-dominio.com/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workhoops.com","password":"TuPasswordSeguro123"}'
```

### 2. Login con Password Incorrecto
```bash
# Debe retornar error genérico
curl -X POST https://tu-dominio.com/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workhoops.com","password":"WrongPassword"}'
```

### 3. Request OTP
```bash
curl -X POST https://tu-dominio.com/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'
```

### 4. Acceso /admin sin ser Admin
```bash
# Debe redirigir a /dashboard
# Visitar https://tu-dominio.com/admin como usuario no-admin
```

### 5. Rate Limiting
```bash
# 6 registros seguidos - el 6to debe dar 429
for i in {1..6}; do
  curl -X POST https://tu-dominio.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@test.com\",\"password\":\"Test1234\",\"name\":\"Test\"}"
done
```

---

## 📁 ARCHIVOS DE DOCUMENTACIÓN GENERADOS

```
/app/INFORME_TECNICO_WORKHOOPS.md      # Arquitectura general
/app/SCHEMA_SQL_COMPLETO.sql           # Schema BD exportable
/app/INFORME_SEGURIDAD_CTO.md          # Resumen seguridad
/app/CODIGO_COMPLETO_SEGURIDAD.md      # Código para CTO
/app/PLAN_SEGURIDAD_COMPLETO.md        # Plan de implementación
/app/MIGRATION_SECURITY_FIELDS.sql     # SQL para migración
```

---

## ⚠️ IMPORTANTE

1. **NEXTAUTH_SECRET**: Considera rotarlo después de este cambio (invalidará sesiones existentes)

2. **Usuarios Legacy**: Todos los usuarios sin `passwordHash` ahora tienen `mustResetPassword=true` y deben usar el flujo OTP

3. **Email**: Asegúrate de que Resend está configurado correctamente para enviar los OTPs

4. **Backup**: Haz backup de la BD antes de ejecutar la migración SQL

---

**Implementación completada: 26/02/2026**
