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

// Parse CSV text to array of objects
function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
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

      // Crear perfil de talento
      const birthDate = row.fecha_nacimiento ? new Date(row.fecha_nacimiento) : new Date('2000-01-01')
      
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          fullName: row.nombre_completo || 'Sin nombre',
          birthDate,
          role: 'jugador',
          city: row.ciudad || 'Madrid',
          country: row.pais || 'España',
          position: row.posicion || null,
          height: row.altura ? parseInt(row.altura) : null,
          weight: row.peso ? parseInt(row.peso) : null,
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

      // Crear perfil de entrenador
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
          fullName: row.nombre_completo || 'Sin nombre',
          city: row.ciudad || 'Madrid',
          nationality: row.pais || 'España',
          totalExperience: row.experiencia_años ? parseInt(row.experiencia_años) : 0,
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
      if (!row.titulo || !row.tipo || !row.nivel) {
        result.errors++
        result.details.push(`Fila ${row._rowNumber}: Faltan campos obligatorios (titulo, tipo, nivel)`)
        continue
      }

      // Crear slug único
      const baseSlug = row.titulo
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
          title: row.titulo,
          slug,
          description: row.descripcion || 'Sin descripción',
          type: row.tipo,
          level: row.nivel,
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
