# 🐛 PROBLEMA RESUELTO - Detección de Plan en Publicación de Ofertas

## 📋 Problema Reportado

Usuario con **plan destacado activado** no puede publicar ofertas. El sistema muestra el mensaje:
> "Ya tienes una oferta publicada. Con el plan gratis solo puedes tener 1 oferta activa. Actualiza al plan Pro para publicar hasta 3 ofertas."

A pesar de que el usuario **SÍ tiene el plan contratado**.

---

## 🔍 Causa Raíz

El endpoint `/app/app/api/opportunities/route.ts` estaba verificando:
- ❌ `validatedData.featured` (campo del formulario) 
- ❌ NO verificaba el `planType` real del usuario en la base de datos

**Código anterior (INCORRECTO):**
```typescript
// Verificaba un campo "featured" del formulario, no el plan real del usuario
if (validatedData.featured) {
  // Permitía hasta 3 ofertas
} else {
  // Solo 1 oferta (plan gratis)
}
```

---

## ✅ Solución Aplicada

Actualizado `/app/app/api/opportunities/route.ts` para:

1. **Consultar el `planType` real del usuario** desde la base de datos
2. **Verificar contra múltiples nombres de planes** (compatibilidad con diferentes valores)
3. **Logging detallado** para debugging

**Código nuevo (CORRECTO):**
```typescript
// Obtener el plan real del usuario desde la BD
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { planType: true }
})

const userPlanType = user?.planType || 'free_amateur'

// Planes gratuitos vs premium
const freePlans = ['free_amateur', 'gratis', 'free']
const isPremiumPlan = !freePlans.includes(userPlanType)

if (isPremiumPlan) {
  // Planes premium: hasta 3 ofertas
  if (userOpportunities >= 3) {
    return error("Límite de 3 ofertas alcanzado")
  }
} else {
  // Plan gratis: solo 1 oferta
  if (userOpportunities >= 1) {
    return error("Actualiza al plan Pro")
  }
}
```

---

## 📊 Valores de `planType` Soportados

Según el schema de Prisma (`/app/prisma/schema.prisma`):

| Valor en BD | Descripción | Límite Ofertas |
|-------------|-------------|----------------|
| `free_amateur` | Plan gratuito | 1 oferta |
| `gratis` | Plan gratuito (legacy) | 1 oferta |
| `pro_semipro` | Plan Pro | 3 ofertas |
| `club_agencia` | Plan Club/Agencia | 3 ofertas |
| `destacado` | Plan Destacado | 3 ofertas |

---

## 🧪 Cómo Verificar el Plan de un Usuario

### Opción 1: Admin Dashboard
```
1. Ve a /admin/users
2. Busca el usuario por email
3. Verás el badge con el plan activo
4. Detalles del plan con fechas de inicio/fin
```

### Opción 2: Consola de Base de Datos (Supabase)
```sql
SELECT 
  email, 
  planType, 
  planStart, 
  planEnd,
  isActive
FROM users 
WHERE email = 'usuario@ejemplo.com';
```

### Opción 3: Logs del Servidor
Ahora el endpoint registra en los logs:
```
User plan type: destacado
User has 1 opportunities, plan: destacado
```

Ver logs:
```bash
tail -f /var/log/supervisor/frontend.err.log | grep "plan type"
```

---

## 🔄 Flujo de Publicación Actualizado

```
┌─────────────────────────────────────────┐
│  Usuario intenta publicar oferta        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  API consulta planType de la BD         │
│  SELECT planType FROM users WHERE...    │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Cuenta ofertas actuales del usuario    │
│  COUNT WHERE status IN (borrador,       │
│                         publicada)       │
└─────────────────────────────────────────┘
                  │
            ┌─────┴─────┐
            │           │
            ▼           ▼
    ┌────────────┐  ┌──────────────┐
    │ Plan GRATIS│  │ Plan PREMIUM │
    │ Límite: 1  │  │ Límite: 3    │
    └────────────┘  └──────────────┘
            │           │
            ▼           ▼
    ┌────────────┐  ┌──────────────┐
    │ Permitir o │  │ Permitir o   │
    │ Rechazar   │  │ Rechazar     │
    └────────────┘  └──────────────┘
```

---

## 🧪 Prueba el Fix

### Test 1: Usuario con Plan Premium
```
1. Asegúrate de que tu usuario tiene planType = 'destacado'
2. Ve a /publicar
3. Intenta publicar una segunda oferta
4. Debería permitirte (hasta 3 ofertas)
```

### Test 2: Usuario con Plan Gratis
```
1. Crea un usuario de prueba sin plan
2. Publica 1 oferta
3. Intenta publicar una segunda
4. Debería mostrarte el mensaje de límite alcanzado
```

### Test 3: Verificar Logs
```
1. Publica una oferta
2. Revisa los logs del servidor
3. Deberías ver:
   - "User plan type: destacado"
   - "User has X opportunities, plan: destacado"
```

---

## 🚨 Si el Problema Persiste

### Paso 1: Verificar el Plan en la Base de Datos
```sql
-- Consulta en Supabase
SELECT 
  id,
  email, 
  planType, 
  planStart, 
  planEnd
FROM users 
WHERE email = 'TU_EMAIL@ejemplo.com';
```

**Resultado esperado:**
- `planType` debería ser `'destacado'` o `'pro_semipro'`
- `planStart` debería tener una fecha reciente
- `planEnd` debería ser en el futuro

### Paso 2: Verificar el Pago en Stripe
```
1. Ve a tu dashboard de Stripe
2. Busca el customer ID del usuario
3. Verifica que el pago se procesó correctamente
4. Verifica que el webhook se ejecutó
```

### Paso 3: Actualizar Manualmente el Plan (Solo para Testing)
```sql
-- Si el pago se procesó pero no se actualizó el plan
UPDATE users 
SET 
  planType = 'destacado',
  planStart = NOW(),
  planEnd = NOW() + INTERVAL '60 days'
WHERE email = 'TU_EMAIL@ejemplo.com';
```

### Paso 4: Revisar Webhooks de Stripe
En el dashboard de Stripe:
```
1. Ve a "Developers" → "Webhooks"
2. Busca el evento "checkout.session.completed"
3. Verifica que el status sea "succeeded"
4. Revisa el payload para confirmar que planType está en metadata
```

---

## 📝 Debugging Checklist

Si encuentras este problema, verifica:

- [ ] ¿El usuario tiene `planType` correcto en la BD?
- [ ] ¿El pago se procesó en Stripe?
- [ ] ¿El webhook de Stripe se ejecutó correctamente?
- [ ] ¿El usuario tiene ofertas en estado 'borrador' o 'publicada'?
- [ ] ¿Los logs muestran el plan correcto?

---

## 🔧 Código Relevante

### Archivo: `/app/app/api/opportunities/route.ts`
**Líneas: 103-142**

```typescript
// Get user's plan type from database
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { planType: true }
})

const userPlanType = user?.planType || 'free_amateur'
console.log('User plan type:', userPlanType)

// Get user's current opportunities count
const userOpportunities = await prisma.opportunity.count({
  where: {
    authorId: session.user.id,
    status: { in: ['borrador', 'publicada'] }
  }
})

console.log('User has', userOpportunities, 'opportunities, plan:', userPlanType)

// Check limits based on user's plan type
const freePlans = ['free_amateur', 'gratis', 'free']
const isPremiumPlan = !freePlans.includes(userPlanType)

if (isPremiumPlan) {
  if (userOpportunities >= 3) {
    return NextResponse.json(
      { message: 'Has alcanzado el límite de 3 ofertas con tu plan.' },
      { status: 403 }
    )
  }
} else {
  if (userOpportunities >= 1) {
    return NextResponse.json(
      { message: 'Actualiza al plan Pro para publicar más ofertas.' },
      { status: 403 }
    )
  }
}
```

---

## ✅ Resultado

Ahora el sistema:
- ✅ Consulta el plan real del usuario desde la base de datos
- ✅ Soporta múltiples nombres de planes
- ✅ Registra información detallada en logs
- ✅ Permite a usuarios con planes premium publicar hasta 3 ofertas
- ✅ Restringe a usuarios gratuitos a 1 oferta

---

## 📞 Si Necesitas Más Ayuda

1. Comparte el email del usuario afectado
2. Comparte los logs del servidor cuando intente publicar
3. Comparte una captura del plan en Admin Dashboard
4. Verifica el planType en la base de datos con la query SQL de arriba
