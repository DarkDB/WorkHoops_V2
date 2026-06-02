# ✅ CATEGORÍAS DE BALONCESTO ACTUALIZADAS - 2025

## 📋 Cambios Implementados

Se han actualizado las categorías de baloncesto en el formulario de publicación de ofertas según la **estructura oficial de la FEB 2025**.

---

## 🏀 Nuevas Categorías Oficiales

### **Categorías Nacionales Profesionales**
1. **ACB - Liga Endesa**
   - Primera división profesional
   - Máxima categoría del baloncesto español
   - Liga privada gestionada por la Asociación de Clubes

2. **Primera FEB (antes LEB Oro)**
   - Segunda división nacional
   - Gestionada por la Federación Española de Baloncesto
   - 18 equipos, ascenso directo a ACB

3. **Segunda FEB (antes LEB Plata)**
   - Tercera división nacional
   - Dos conferencias (Este y Oeste)
   - Camino hacia Primera FEB

4. **Tercera FEB (antes Liga EBA)**
   - Cuarta división nacional
   - ~140 equipos en 5 grupos regionales
   - Competiciones por proximidad geográfica

### **Categorías Autonómicas y Provinciales**
5. **1ª División Autonómica**
   - Ligas regionales por comunidad autónoma
   - Cada comunidad organiza sus propias competiciones
   - Ejemplos: Liga Catalana, Liga Madrileña, Liga Andaluza

6. **Liga Provincial**
   - Competiciones a nivel provincial
   - Organizadas por federaciones provinciales
   - Base de la pirámide del baloncesto federado

### **Formación y Amateur**
7. **Cantera / Formación**
   - Categorías base: Mini, Infantil, Cadete, Junior
   - Selecciones autonómicas
   - Campeonatos de España de Clubes

8. **Amateur / Recreativo**
   - Baloncesto no federado
   - Ligas locales y recreativas
   - Torneos amateurs

---

## 🔧 Cambios Técnicos

### **Archivos Modificados**

1. **`/app/app/publicar/page.tsx`**
   - Actualizado array `levels` con 8 categorías oficiales
   - Cada categoría incluye: value, label, description

2. **`/app/lib/validations.ts`**
   - Actualizado enum de Zod con las nuevas categorías
   - Mantiene valores legacy para compatibilidad

3. **`/app/app/api/opportunities/route.ts`**
   - Agregado mapeo de nuevas categorías a valores de Prisma
   - Mapeo inteligente: ACB/Primera FEB → profesional, Segunda/Tercera FEB → semi_profesional

4. **`/app/app/api/opportunities/[slug]/route.ts`**
   - Mismo mapeo para la actualización de ofertas

5. **`/app/components/EditOpportunityForm.tsx`**
   - Actualizado selector de niveles con las 8 categorías

---

## 📊 Mapeo a Base de Datos

Como Prisma solo soporta 4 valores (`profesional`, `semi_profesional`, `amateur`, `cantera`), las nuevas categorías se mapean así:

| Categoría Formulario | Valor en BD |
|---------------------|-------------|
| ACB | `profesional` |
| Primera FEB | `profesional` |
| Segunda FEB | `semi_profesional` |
| Tercera FEB | `semi_profesional` |
| 1ª División Autonómica | `semi_profesional` |
| Liga Provincial | `amateur` |
| Cantera / Formación | `cantera` |
| Amateur / Recreativo | `amateur` |

---

## 🎯 Beneficios

✅ **Precisión:** Refleja la estructura oficial actualizada de 2025
✅ **Claridad:** Categorías específicas y reconocibles
✅ **Flexibilidad:** Soporta desde ACB hasta amateur
✅ **Autonómicas:** Reconoce las ligas regionales y provinciales
✅ **Formación:** Diferencia cantera de amateur

---

## 📝 Nota sobre Ligas Autonómicas

Has mencionado correctamente que cada comunidad autónoma tiene sus propias reglas y estructura. El sistema implementado permite:

- Seleccionar "1ª División Autonómica" como categoría general
- El campo "ciudad" permite especificar la ubicación
- Se podría ampliar en el futuro con un selector específico de comunidad autónoma si se requiere mayor granularidad

**Ejemplos de ligas autonómicas:**
- **Cataluña:** Liga Catalana de Baloncesto
- **Madrid:** Liga Madrileña
- **Andalucía:** Liga Andaluza (por provincias)
- **Valencia:** Liga Valenciana
- **Galicia:** Liga Gallega
- Y así para cada comunidad autónoma

---

## 🔄 Compatibilidad

El sistema mantiene compatibilidad con valores antiguos:
- `semipro`, `semi_pro` → `semi_profesional`
- `profesional` → `profesional`
- `juvenil`, `infantil` → `cantera`

---

## 🧪 Cómo Probar

1. Ve a `/publicar`
2. En el campo "Nivel", verás las 8 nuevas categorías
3. Selecciona cualquiera (ej: "ACB - Liga Endesa")
4. Publica la oferta
5. Verifica que se guarda correctamente

Para editar ofertas existentes:
1. Ve al dashboard
2. Edita una oferta
3. El selector mostrará las nuevas categorías
4. Los valores antiguos se mapearán automáticamente

---

## 📞 Si Necesitas Más Ajustes

Si necesitas:
- Agregar más subcategorías
- Selector específico de comunidad autónoma
- Campos adicionales para ligas provinciales
- Cualquier otra personalización

Solo avísame y lo implemento.

---

## ⚠️ Pendiente del Error

**Por favor, comparte el error que mencionaste al inicio** para poder solucionarlo también.
