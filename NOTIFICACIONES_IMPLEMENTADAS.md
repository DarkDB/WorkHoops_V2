# 🔔 Sistema de Notificaciones en Tiempo Real - Documentación

## ✅ Implementación Completada

Se ha creado un sistema completo de notificaciones en tiempo real para mejorar el engagement de los usuarios.

---

## 📊 Componentes Implementados

### 1. **Modelo de Datos (Prisma)**

```prisma
model Notification {
  id          String   @id @default(cuid())
  type        String   // Tipo de notificación
  title       String   // Título corto
  message     String   // Mensaje descriptivo
  link        String?  // URL de destino (opcional)
  read        Boolean  @default(false)  // Estado leído/no leído
  createdAt   DateTime @default(now())
  
  // Relación
  userId      String
  user        User     @relation(...)
}
```

**Índices creados** para performance:
- `userId` - Búsqueda rápida por usuario
- `read` - Filtrar por estado
- `createdAt` - Ordenamiento temporal

---

### 2. **API Endpoints**

#### GET `/api/notifications`
**Descripción**: Obtiene las notificaciones del usuario autenticado

**Response**:
```json
{
  "notifications": [
    {
      "id": "...",
      "type": "application_received",
      "title": "Nueva aplicación recibida",
      "message": "Juan Pérez ha aplicado a tu oferta...",
      "link": "/dashboard/applications/123",
      "read": false,
      "createdAt": "2025-12-01T10:30:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Características**:
- Devuelve últimas 20 notificaciones
- Incluye contador de no leídas
- Ordenadas por fecha (más recientes primero)

#### POST `/api/notifications`
**Descripción**: Marca una notificación como leída

**Body**:
```json
{
  "notificationId": "clxxx..."
}
```

**Response**:
```json
{
  "success": true
}
```

#### PATCH `/api/notifications`
**Descripción**: Marca TODAS las notificaciones del usuario como leídas

**Response**:
```json
{
  "success": true
}
```

---

### 3. **Componente Frontend: NotificationBell**

**Ubicación**: `/app/components/NotificationBell.tsx`

**Características**:
- ✅ Badge con contador animado (pulse effect)
- ✅ Dropdown con lista de notificaciones
- ✅ Iconos visuales por tipo de notificación
- ✅ Tiempo relativo ("hace 5 minutos")
- ✅ Marcar individual como leída
- ✅ Marcar todas como leídas
- ✅ Link directo a la página relevante
- ✅ Polling cada 30 segundos (actualizaciones automáticas)
- ✅ Estados: cargando, vacío, con notificaciones

**Tipos de Notificaciones Soportados**:

| Tipo | Icono | Descripción |
|------|-------|-------------|
| `application_received` | 📩 | Nueva aplicación recibida en tu oferta |
| `application_viewed` | 👀 | Tu aplicación fue vista por el reclutador |
| `application_accepted` | ✅ | Tu aplicación fue aceptada |
| `application_rejected` | ❌ | Tu aplicación no fue seleccionada |
| `message_received` | 💬 | Nuevo mensaje recibido |
| `profile_saved` | ⭐ | Alguien guardó tu perfil como favorito |

**UI States**:
- **Sin notificaciones**: Mensaje amigable con icono
- **Con notificaciones**: Lista con preview
- **No leídas**: Fondo azul claro para destacar
- **Badge rojo**: Contador animado (máximo 9+)

---

### 4. **Funciones Helper** (`/app/lib/notifications.ts`)

Para facilitar la creación de notificaciones desde cualquier parte del código:

```typescript
// Función genérica
await createNotification({
  userId: "user123",
  type: "application_received",
  title: "Título",
  message: "Mensaje descriptivo",
  link: "/dashboard/..."  // Opcional
})

// Funciones específicas (ya implementadas):
await notifyApplicationReceived(ownerId, applicantName, opportunityTitle, appId)
await notifyApplicationViewed(applicantId, opportunityTitle, appId)
await notifyApplicationAccepted(applicantId, opportunityTitle, appId)
await notifyApplicationRejected(applicantId, opportunityTitle, appId)
await notifyMessageReceived(recipientId, senderName, messagePreview)
await notifyProfileSaved(profileOwnerId, saverName)
```

**Ventajas**:
- API consistente
- Tipado seguro con TypeScript
- Manejo de errores silencioso (no rompe flujo principal)
- Fácil de usar desde cualquier endpoint

---

## 🚀 Integración en el Navbar

El componente `NotificationBell` se agregó al Navbar entre el botón de "Publicar" y el menú de usuario.

**Ubicación visual**:
```
[Logo] [Oportunidades] [Talento] [Clubes] [Recursos] [Precios]  |  [🔔 Notificaciones] [👤 Usuario]
```

**Solo visible para usuarios autenticados**.

---

## 📋 Casos de Uso

### Caso 1: Nueva Aplicación
1. Usuario A aplica a oferta de Usuario B
2. Se llama: `notifyApplicationReceived(userB.id, userA.name, opportunity.title, app.id)`
3. Usuario B ve badge rojo con "1"
4. Click → Dropdown muestra: "📩 Nueva aplicación recibida | Juan Pérez ha aplicado a..."
5. Click en "Ver detalles" → Va a `/dashboard/applications/[id]`

### Caso 2: Aplicación Vista
1. Usuario B revisa la aplicación de Usuario A
2. Se llama: `notifyApplicationViewed(userA.id, opportunity.title, app.id)`
3. Usuario A ve notificación: "👀 Tu aplicación fue vista"

### Caso 3: Marcar como Leída
1. Usuario hace click en el ✓ de una notificación
2. POST a `/api/notifications` con `notificationId`
3. Notificación cambia de fondo azul a blanco
4. Contador disminuye en 1

### Caso 4: Marcar Todas
1. Usuario hace click en "Marcar todas"
2. PATCH a `/api/notifications`
3. Todas las notificaciones se marcan como leídas
4. Badge desaparece (contador = 0)

---

## ⚙️ Configuración Técnica

### Polling
- **Intervalo**: 30 segundos
- **Método**: `setInterval` en el componente
- **Limpieza**: Se limpia al desmontar el componente

### Performance
- Solo se cargan 20 notificaciones (LIMIT 20)
- Solo se muestran 10 en el dropdown (slice(0, 10))
- Índices en BD para queries rápidas
- Contadores pre-calculados en el backend

### Estados de Carga
```typescript
[loading] → [sin notificaciones | con notificaciones]
                       ↓                    ↓
                   Icono gris         Badge rojo animado
```

---

## 🎨 Diseño UI/UX

### Colores
- Badge rojo: `bg-red-500` con `animate-pulse`
- No leídas: `bg-blue-50`
- Leídas: `bg-white` con `hover:bg-gray-50`

### Iconos
- Campana (Bell): Icono principal
- Emojis: Por tipo de notificación (📩 👀 ✅ ❌ 💬 ⭐)
- Check: Para marcar como leída

### Texto
- Título: `font-medium text-sm`
- Mensaje: `text-gray-600 text-sm`
- Tiempo: `text-gray-400 text-xs` (relativo: "hace 5 min")

### Animaciones
- Badge: Pulse animation para llamar la atención
- Hover: Transición suave en notificaciones
- Estados: Cambios de color graduales

---

## 📦 Archivos Creados/Modificados

### Nuevos Archivos
1. `/app/prisma/schema.prisma` - Modelo Notification agregado
2. `/app/app/api/notifications/route.ts` - API endpoints
3. `/app/components/NotificationBell.tsx` - Componente UI
4. `/app/lib/notifications.ts` - Helper functions
5. `/app/NOTIFICACIONES_IMPLEMENTADAS.md` - Este documento

### Archivos Modificados
1. `/app/components/Navbar.tsx` - Agregado NotificationBell

---

## 🧪 Testing

### Manual Testing
1. ✅ Build exitoso (sin errores TypeScript)
2. ✅ Componente se renderiza en Navbar
3. ✅ Badge oculto cuando no hay notificaciones

### Testing Pendiente (requiere BD activa)
- [ ] Crear notificación de prueba
- [ ] Verificar que aparece en el dropdown
- [ ] Marcar como leída
- [ ] Marcar todas como leídas
- [ ] Verificar polling (esperar 30s)
- [ ] Click en link y verificar navegación

### Comando para Testing Manual
```typescript
// Desde consola del navegador o API
await fetch('/api/notifications/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'application_received',
    title: 'Test',
    message: 'Mensaje de prueba'
  })
})
```

---

## 🔄 Próximos Pasos Sugeridos

### Mejoras Futuras
1. **WebSockets / Server-Sent Events**
   - Notificaciones instantáneas sin polling
   - Menor carga en el servidor

2. **Preferencias de Notificaciones**
   - Usuario elige qué tipos recibir
   - Frecuencia de emails vs in-app

3. **Notificaciones Push**
   - Usando Service Workers
   - Notificaciones de navegador

4. **Sonido/Vibración**
   - Alert sonoro opcional
   - Vibración en móvil

5. **Agrupación**
   - "5 personas han aplicado a tu oferta"
   - En lugar de 5 notificaciones individuales

6. **Página Dedicada**
   - `/dashboard/notifications` con historial completo
   - Filtros por tipo
   - Búsqueda

7. **Analytics**
   - Tasa de apertura de notificaciones
   - Tipos más efectivos
   - Tiempo de respuesta

---

## 🐛 Troubleshooting

### Badge no aparece
- Verificar que el usuario esté autenticado
- Revisar consola del navegador (F12)
- Verificar API: `fetch('/api/notifications').then(r => r.json())`

### Notificaciones no se actualizan
- Esperar 30 segundos (polling interval)
- Verificar que la BD esté accesible
- Revisar logs del servidor

### Contador incorrecto
- Verificar query en `/api/notifications`
- Verificar índice `read` en la tabla

---

## 📊 Métricas de Éxito

**KPIs a medir**:
- % de notificaciones leídas
- Tiempo promedio hasta leer una notificación
- Click-through rate (CTR) en los links
- Engagement: usuarios que regresan por notificaciones

**Objetivo**:
- CTR > 40%
- Tasa de lectura > 70%
- Tiempo de respuesta < 24 horas

---

**Fecha de implementación**: Diciembre 1, 2025  
**Tiempo de desarrollo**: ~1 hora  
**Estado**: ✅ Completado - Pendiente de integrar en flujos existentes  
**Build**: Exitoso sin errores
