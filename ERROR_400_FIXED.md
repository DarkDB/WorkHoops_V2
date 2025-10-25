# 🐛 ERROR 400 CORREGIDO - Edición de Ofertas

## 📋 Problema Reportado

Al editar una oferta y hacer clic en "Guardar", se producía un error 400 (Bad Request) y los cambios no se guardaban.

## 🔍 Diagnóstico

### Error Principal
```
Invalid value for argument `level`. Expected OpportunityLevel.
```

### Causa Raíz
1. **Incompatibilidad de valores enum**: El formulario enviaba `"semipro"` pero Prisma esperaba `"semi_profesional"`
2. **Valores no válidos**: El formulario incluía opciones `"juvenil"` e `"infantil"` que no existen en el enum de Prisma
3. **Manejo incorrecto de campos vacíos**: El campo `applicationUrl` vacío no se manejaba correctamente

### Valores del Enum en Prisma
```prisma
enum OpportunityLevel {
  amateur
  semi_profesional
  profesional
  cantera
}
```

## ✅ Soluciones Aplicadas

### 1. Actualizado `/app/app/api/opportunities/[slug]/route.ts`

#### Mapeo de Valores
Agregado mapeo automático de valores del formulario a valores válidos de Prisma:

```typescript
const levelMap: Record<string, string> = {
  'semipro': 'semi_profesional',
  'semi_pro': 'semi_profesional',
  'semi-pro': 'semi_profesional',
  'semi_profesional': 'semi_profesional',
  'profesional': 'profesional',
  'amateur': 'amateur',
  'cantera': 'cantera',
  'juvenil': 'cantera',    // Mapear juvenil a cantera
  'infantil': 'cantera',   // Mapear infantil a cantera
}
```

#### Manejo de Campo URL Vacío
```typescript
if (data.applicationUrl !== undefined) {
  // Permitir string vacío, convertirlo a null
  sanitizedData.applicationUrl = data.applicationUrl === '' ? null : data.applicationUrl
}
```

#### Mejora en Manejo de Errores
```typescript
// Devuelve mensajes de error más informativos
if (error.message.includes('Invalid value for argument')) {
  return NextResponse.json(
    { 
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos. Por favor, revisa los campos.',
      details: error.message
    },
    { status: 400 }
  )
}
```

### 2. Actualizado `/app/components/EditOpportunityForm.tsx`

#### Opciones de Nivel Corregidas
```typescript
const levels = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'semi_profesional', label: 'Semi-profesional' },
  { value: 'amateur', label: 'Amateur' },
  { value: 'cantera', label: 'Cantera' }
]
```

**Cambios:**
- ❌ Eliminado: `"semipro"`, `"juvenil"`, `"infantil"`
- ✅ Agregado: `"semi_profesional"`, `"cantera"`

#### Mejor Manejo de Errores
```typescript
if (!response.ok) {
  const errorMessage = data.message || data.error || 'Error al actualizar la oferta'
  throw new Error(errorMessage)
}
```

### 3. Actualizado `/app/lib/validations.ts`

Schema más flexible para actualizaciones:
```typescript
export const opportunityUpdateSchema = opportunityCreateSchema.partial()
```

## 🧪 Cómo Probar

1. **Inicia sesión** con una cuenta de Club o Agencia
2. **Ve al Dashboard** y busca una oferta publicada
3. **Haz clic en "Editar"**
4. **Modifica los campos**:
   - Cambia el título
   - Cambia el nivel (prueba "Semi-profesional")
   - Deja el campo URL vacío o agrégale un valor
   - Modifica la descripción
5. **Haz clic en "Guardar cambios"**
6. **Verifica**:
   - Debe mostrar mensaje de éxito "¡Oferta actualizada!"
   - Debe redirigir al dashboard después de 1.5 segundos
   - Los cambios deben estar guardados al ver la oferta nuevamente

## 📊 Logs para Verificación

Los cambios ahora registran información detallada en los logs:

```bash
# Ver logs en tiempo real
tail -f /var/log/supervisor/frontend.err.log

# Buscar errores específicos
grep "Update opportunity" /var/log/supervisor/frontend.err.log
```

**Logs esperados:**
```
Update opportunity - Received data: { ... }
Update opportunity - Sanitized data: { ... }
```

## ✨ Mejoras Adicionales

1. **Validación mejorada**: El endpoint ahora valida y mapea automáticamente los valores
2. **Mensajes de error claros**: El usuario ve mensajes específicos sobre qué salió mal
3. **Logging detallado**: Los desarrolladores pueden debuggear fácilmente con los logs
4. **Compatibilidad retroactiva**: El mapeo soporta múltiples variaciones de valores

## 🚨 Notas Importantes

### Para Futuras Modificaciones

Si necesitas agregar nuevos niveles:

1. **Actualiza el enum en Prisma** (`/app/prisma/schema.prisma`):
```prisma
enum OpportunityLevel {
  amateur
  semi_profesional
  profesional
  cantera
  nuevo_nivel  // <-- Agrega aquí
}
```

2. **Ejecuta la migración**:
```bash
npx prisma migrate dev --name add_new_level
```

3. **Actualiza el formulario** (`/app/components/EditOpportunityForm.tsx`):
```typescript
const levels = [
  // ... existing levels
  { value: 'nuevo_nivel', label: 'Nuevo Nivel' }
]
```

4. **Actualiza el mapeo** (si es necesario) en el API endpoint

## 🎯 Resultado Final

✅ La edición de ofertas ahora funciona correctamente
✅ Los valores se mapean automáticamente a los valores válidos de Prisma
✅ Los campos vacíos se manejan correctamente
✅ Los mensajes de error son claros y útiles
✅ Los cambios se guardan correctamente en la base de datos

## 🔄 Próximos Pasos

Si aún experimentas problemas:

1. Verifica los logs con el comando mencionado arriba
2. Comprueba que el nivel seleccionado es uno de los válidos
3. Asegúrate de que la sesión de usuario es válida
4. Verifica que el slug de la oportunidad es correcto

Si el problema persiste, por favor comparte:
- El mensaje de error exacto
- Los logs del servidor
- El nivel seleccionado en el formulario
