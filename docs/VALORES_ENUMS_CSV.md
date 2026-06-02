# 📋 Valores Válidos para CSV de Ofertas

## ✅ Campo: tipo (OpportunityType)

### Valores Oficiales
- `empleo`
- `prueba`
- `torneo`
- `clinica`
- `beca`
- `patrocinio`

### ✨ Alias Automáticos (se normalizan automáticamente)

| Tu puedes escribir | Se convierte a |
|-------------------|----------------|
| Empleo, EMPLEO, trabajo, job | empleo |
| Prueba, PRUEBA, tryout | prueba |
| Torneo, TORNEO, tournament | torneo |
| Clinica, CLINICA, clinic | clinica |
| Beca, BECA, scholarship | beca |
| Patrocinio, PATROCINIO, sponsor | patrocinio |

**✅ Mayúsculas/minúsculas**: No importa  
**✅ Espacios**: Se eliminan automáticamente

---

## ✅ Campo: nivel (OpportunityLevel)

### Valores Oficiales
- `amateur`
- `semi_profesional`
- `profesional`
- `cantera`

### ✨ Alias Automáticos

| Tu puedes escribir | Se convierte a |
|-------------------|----------------|
| Amateur, AMATEUR, aficionado | amateur |
| Semi profesional, semi_profesional, semiprofesional | semi_profesional |
| Profesional, PROFESIONAL, pro | profesional |
| Cantera, CANTERA, formación, formacion, base, youth, junior, juvenil, cadete, infantil, alevin, benjamin, escolar | cantera |

### 🎯 Detección Inteligente

El sistema también detecta niveles por contexto:

| Si escribes | Se detecta como |
|-------------|----------------|
| "Cantera / Formación" | cantera |
| "1ª División Autonómica" | semi_profesional |
| "Primera División", "ACB", "LEB" | profesional |
| Cualquier texto con "división" | semi_profesional |

---

## 📝 Ejemplos de CSV Válidos

### ✅ Ejemplo 1: Formato estándar (minúsculas)
```csv
titulo,tipo,nivel,ciudad,descripcion,email_contacto,fecha_limite,salario_min,salario_max
Busco Base,empleo,semi_profesional,Madrid,Buscamos base con experiencia,contacto@club.com,2025-12-31,800,1200
```

### ✅ Ejemplo 2: Con mayúsculas (se normalizan automáticamente)
```csv
titulo,tipo,nivel,ciudad,descripcion,email_contacto,fecha_limite,salario_min,salario_max
Busco Base,Empleo,Semi Profesional,Madrid,Buscamos base con experiencia,contacto@club.com,2025-12-31,800,1200
```

### ✅ Ejemplo 3: Con texto descriptivo (se detecta automáticamente)
```csv
titulo,tipo,nivel,ciudad,descripcion,email_contacto,fecha_limite,salario_min,salario_max
Entrenador Alevín,Empleo,Cantera / Formación,Madrid,Entrenador para categoría alevín,contacto@club.com,,,
Torneo 3x3,Torneo,Amateur,Valencia,Torneo abierto categoría amateur,info@torneo.com,2025-06-15,,
Base EBA,Trabajo,1ª División Autonómica,Barcelona,Buscamos base para Liga EBA,club@email.com,2025-12-31,1000,1500
```

---

## ❌ Errores Comunes

### Error: "Tipo inválido"
```
Tipo inválido "Oferta". Valores permitidos: empleo, prueba, torneo, clinica, beca, patrocinio
```

**Solución**: Usa uno de los valores válidos o sus alias.

### Error: "Nivel inválido"
```
Nivel inválido "Avanzado". Valores permitidos: amateur, semi_profesional, profesional, cantera
```

**Solución**: Usa uno de los valores válidos o describe el nivel de forma que se pueda detectar automáticamente.

---

## 💡 Consejos

1. **No te preocupes por mayúsculas/minúsculas**: El sistema normaliza todo
2. **Usa descripciones naturales**: "Cantera / Formación" funciona perfectamente
3. **Revisa el reporte de errores**: Te dirá exactamente qué valor no se reconoció
4. **Campos opcionales vacíos**: Déjalos en blanco, se aceptan

---

## 🧪 Testing Rápido

Si no estás seguro de un valor, puedes:

1. Crear un CSV con 1-2 filas de prueba
2. Intentar importar
3. Ver el reporte (si hay error, te dice qué valor no se reconoció)
4. Ajustar y volver a intentar

---

**Fecha**: Diciembre 2, 2025  
**Versión**: 2.0 (con normalización automática)
