import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ImportResult {
  success: number
  errors: number
  details: string[]
}

// Parse CSV text to array of objects with auto-detection of delimiter
function parseCSV(text: string): any[] {
  // Normalizar saltos de línea y limpiar BOM
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  // Detectar separador (coma o punto y coma)
  const firstLine = lines[0]
  const delimiter = firstLine.includes(';') ? ';' : ','
  
  console.log(`Detected CSV delimiter: "${delimiter}"`)
  
  // Parsear headers
  const headers = firstLine.split(delimiter).map(h => 
    h.trim().replace(/^["']|["']$/g, '') // Remover comillas
  )
  
  console.log('Headers detected:', headers)
  
  // Parsear filas
  return lines.slice(1).map((line, index) => {
    // Split por el delimiter, manejando comillas
    let values: string[]
    
    if (line.includes('"') || line.includes("'")) {
      // Parsing avanzado para campos con comillas
      const regex = delimiter === ';' 
        ? /(?:^|;)(?:"([^"]*)"|'([^']*)'|([^;]*))/g
        : /(?:^|,)(?:"([^"]*)"|'([^']*)'|([^,]*))/g
      
      values = []
      let match
      while ((match = regex.exec(line)) !== null) {
        values.push((match[1] || match[2] || match[3] || '').trim())
      }
    } else {
      // Split simple
      values = line.split(delimiter).map(v => v.trim())
    }
    
    const row: any = { _rowNumber: index + 2 }
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    
    return row
  })
}

// Importar jugadores
async function importJugadores(rows: any[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: 0, details: [] }

  for (const row of rows) {
    try {
      const email = row.email
      if (!email || !email.includes('@')) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email inválido`)
        continue
      }

      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({ where: { email } })
      
      if (existingUser) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email ${email} ya existe`)
        continue
      }

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email,
          name: row.nombre_completo || 'Usuario',
          role: 'jugador',
        },
      })

      // Parsear fecha de nacimiento
      let birthDate = new Date('2000-01-01')
      if (row.fecha_nacimiento && row.fecha_nacimiento.trim()) {
        try {
          const parsed = new Date(row.fecha_nacimiento)
          if (!isNaN(parsed.getTime())) {
            birthDate = parsed
          }
        } catch (e) {
          // Usar fecha por defecto
        }
      }
      
      // Parsear altura y peso
      let height = null
      let weight = null
      
      if (row.altura && row.altura.trim()) {
        const parsed = parseInt(row.altura)
        if (!isNaN(parsed)) {
          height = parsed
        }
      }
      
      if (row.peso && row.peso.trim()) {
        const parsed = parseInt(row.peso)
        if (!isNaN(parsed)) {
          weight = parsed
        }
      }
      
      // Crear perfil de talento
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          fullName: row.nombre_completo || 'Sin nombre',
          birthDate,
          role: 'jugador',
          city: row.ciudad || 'Madrid',
          country: row.pais || 'España',
          position: row.posicion || null,
          height,
          weight,
          currentLevel: row.nivel_actual || 'Amateur',
        },
      })

      result.success++
    } catch (error: any) {
      result.errors++
      result.details.push(`Fila ${row._rowNumber}: ${error.message}`)
    }
  }

  return result
}

// Importar entrenadores
async function importEntrenadores(rows: any[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: 0, details: [] }

  for (const row of rows) {
    try {
      const email = row.email
      if (!email || !email.includes('@')) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email inválido`)
        continue
      }

      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({ where: { email } })
      
      if (existingUser) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email ${email} ya existe`)
        continue
      }

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email,
          name: row.nombre_completo || 'Entrenador',
          role: 'entrenador',
        },
      })

      // Parsear experiencia
      let totalExperience = 0
      if (row.experiencia_años && row.experiencia_años.trim()) {
        const parsed = parseInt(row.experiencia_años)
        if (!isNaN(parsed)) {
          totalExperience = parsed
        }
      }
      
      // Crear perfil de entrenador
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
          fullName: row.nombre_completo || 'Sin nombre',
          city: row.ciudad || 'Madrid',
          nationality: row.pais || 'España',
          totalExperience,
          federativeLicense: row.licencia || null,
          categoriesCoached: row.especialidad || null,
        },
      })

      result.success++
    } catch (error: any) {
      result.errors++
      result.details.push(`Fila ${row._rowNumber}: ${error.message}`)
    }
  }

  return result
}

// Importar clubes
async function importClubes(rows: any[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: 0, details: [] }

  for (const row of rows) {
    try {
      const email = row.email_responsable
      if (!email || !email.includes('@')) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Email inválido`)
        continue
      }

      // Buscar o crear usuario responsable
      let user = await prisma.user.findUnique({ where: { email } })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: row.nombre_club || 'Club',
            role: 'club',
          },
        })
      }

      // Crear slug único
      const baseSlug = (row.nombre_club || 'club')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      let slug = baseSlug
      let counter = 1
      
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      // Crear organización
      await prisma.organization.create({
        data: {
          name: row.nombre_club || 'Club sin nombre',
          slug,
          description: row.descripcion || null,
          website: row.website || null,
          ownerId: user.id,
        },
      })

      result.success++
    } catch (error: any) {
      result.errors++
      result.details.push(`Fila ${row._rowNumber}: ${error.message}`)
    }
  }

  return result
}

// Normalizar tipo de oportunidad
function normalizeOpportunityType(type: string): string | null {
  const normalized = type.toLowerCase().trim()
  const mapping: Record<string, string> = {
    'empleo': 'empleo',
    'trabajo': 'empleo',
    'job': 'empleo',
    'prueba': 'prueba',
    'tryout': 'prueba',
    'torneo': 'torneo',
    'tournament': 'torneo',
    'clinica': 'clinica',
    'clinic': 'clinica',
    'beca': 'beca',
    'scholarship': 'beca',
    'patrocinio': 'patrocinio',
    'sponsor': 'patrocinio',
  }
  return mapping[normalized] || null
}

// Normalizar nivel de oportunidad
function normalizeOpportunityLevel(level: string): string | null {
  const normalized = level.toLowerCase().trim()
  
  // Mapeo directo
  if (['amateur', 'semi_profesional', 'profesional', 'cantera'].includes(normalized)) {
    return normalized
  }
  
  // Mapeo de aliases y variaciones
  const mapping: Record<string, string> = {
    'formacion': 'cantera',
    'formación': 'cantera',
    'base': 'cantera',
    'youth': 'cantera',
    'junior': 'cantera',
    'juvenil': 'cantera',
    'cadete': 'cantera',
    'infantil': 'cantera',
    'alevin': 'cantera',
    'benjamin': 'cantera',
    'escolar': 'cantera',
    'semi profesional': 'semi_profesional',
    'semiprofesional': 'semi_profesional',
    'profesional': 'profesional',
    'pro': 'profesional',
    'amateur': 'amateur',
    'aficionado': 'amateur',
  }
  
  // Buscar en el string (para casos como "Cantera / Formación" o "1ª División Autonómica")
  for (const [key, value] of Object.entries(mapping)) {
    if (normalized.includes(key)) {
      return value
    }
  }
  
  // Si contiene números o "división", probablemente es semi_profesional o profesional
  if (normalized.includes('división') || normalized.includes('division')) {
    if (normalized.includes('1ª') || normalized.includes('primera') || normalized.includes('acb') || normalized.includes('leb')) {
      return 'profesional'
    }
    return 'semi_profesional'
  }
  
  return null
}

// Importar ofertas
async function importOfertas(rows: any[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, errors: 0, details: [] }

  // Obtener el primer usuario admin para asignar como autor
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
  
  if (!adminUser) {
    result.errors = rows.length
    result.details.push('No se encontró usuario admin para crear ofertas')
    return result
  }

  for (const row of rows) {
    try {
      // Validar campos obligatorios con mejor debugging
      const titulo = row.titulo?.trim()
      const tipoRaw = row.tipo?.trim()
      const nivelRaw = row.nivel?.trim()
      
      if (!titulo || !tipoRaw || !nivelRaw) {
        result.errors++
        const missing = []
        if (!titulo) missing.push('titulo')
        if (!tipoRaw) missing.push('tipo')
        if (!nivelRaw) missing.push('nivel')
        
        console.log(`Row ${row._rowNumber} missing fields:`, missing, 'Row data:', row)
        result.details.push(`Fila ${row._rowNumber}: Faltan campos obligatorios (${missing.join(', ')})`)
        continue
      }
      
      // Normalizar tipo y nivel
      const tipo = normalizeOpportunityType(tipoRaw)
      const nivel = normalizeOpportunityLevel(nivelRaw)
      
      if (!tipo) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Tipo inválido "${tipoRaw}". Valores permitidos: empleo, prueba, torneo, clinica, beca, patrocinio`)
        continue
      }
      
      if (!nivel) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Nivel inválido "${nivelRaw}". Valores permitidos: amateur, semi_profesional, profesional, cantera`)
        continue
      }

      // Crear slug único
      const baseSlug = titulo
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      let slug = baseSlug
      let counter = 1
      
      while (await prisma.opportunity.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      // Parsear fecha límite
      let deadline = null
      if (row.fecha_limite && row.fecha_limite.trim()) {
        try {
          const parsedDate = new Date(row.fecha_limite)
          if (!isNaN(parsedDate.getTime())) {
            deadline = parsedDate
          }
        } catch (e) {
          // Fecha inválida, se ignora
        }
      }

      // Parsear salarios (convertir strings vacíos en null)
      let remunerationMin = null
      let remunerationMax = null
      
      if (row.salario_min && row.salario_min.trim()) {
        const parsed = parseFloat(row.salario_min)
        if (!isNaN(parsed)) {
          remunerationMin = parsed
        }
      }
      
      if (row.salario_max && row.salario_max.trim()) {
        const parsed = parseFloat(row.salario_max)
        if (!isNaN(parsed)) {
          remunerationMax = parsed
        }
      }

      // Crear oportunidad
      await prisma.opportunity.create({
        data: {
          title: titulo,
          slug,
          description: row.descripcion?.trim() || 'Sin descripción',
          type: tipo as any,
          level: nivel as any,
          status: 'publicada',
          city: row.ciudad || 'Madrid',
          country: 'España',
          contactEmail: row.email_contacto || adminUser.email,
          deadline,
          remunerationMin,
          remunerationMax,
          remunerationType: remunerationMin || remunerationMax ? 'monthly' : null,
          authorId: adminUser.id,
          publishedAt: new Date(),
        },
      })

      result.success++
    } catch (error: any) {
      result.errors++
      result.details.push(`Fila ${row._rowNumber}: ${error.message}`)
    }
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Leer FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    // Leer contenido del archivo
    const text = await file.text()
    const rows = parseCSV(text)

    console.log(`Parsed ${rows.length} rows`)
    if (rows.length > 0) {
      console.log('First row sample:', rows[0])
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Archivo CSV vacío o inválido' }, { status: 400 })
    }

    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Máximo 1000 filas permitidas' }, { status: 400 })
    }

    // Ejecutar importación según el tipo
    let result: ImportResult

    switch (type) {
      case 'jugadores':
        result = await importJugadores(rows)
        break
      case 'entrenadores':
        result = await importEntrenadores(rows)
        break
      case 'clubes':
        result = await importClubes(rows)
        break
      case 'ofertas':
        result = await importOfertas(rows)
        break
      default:
        return NextResponse.json({ error: 'Tipo de importación inválido' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error en importación:', error)
    return NextResponse.json(
      { error: 'Error al procesar importación', details: error.message },
      { status: 500 }
    )
  }
}
