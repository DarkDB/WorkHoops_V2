import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema de validación para crear/actualizar recursos
const resourceSchema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  slug: z.string().min(1, 'Slug es requerido'),
  excerpt: z.string().min(1, 'Extracto es requerido'),
  content: z.string().min(1, 'Contenido es requerido'),
  category: z.enum(['preparacion', 'carrera', 'recursos', 'salud', 'tactica', 'mental']),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional().nullable(),
  author: z.string().min(1, 'Autor es requerido'),
  readTime: z.number().int().positive().default(5),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

// GET - Listar recursos (público con filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir filtros
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (status && status !== 'all') {
      where.status = status
    } else {
      // Por defecto, solo mostrar publicados en frontend
      const session = await getServerSession(authOptions)
      if (!session || session.user?.role !== 'admin') {
        where.status = 'published'
      }
    }
    
    if (featured === 'true') {
      where.featured = true
    }

    // Obtener recursos
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
      }),
      prisma.resource.count({ where })
    ])

    return NextResponse.json({
      resources,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Error al obtener recursos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo recurso (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = resourceSchema.parse(body)

    // Verificar que el slug no exista
    const existingResource = await prisma.resource.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingResource) {
      return NextResponse.json(
        { error: 'Ya existe un recurso con este slug' },
        { status: 400 }
      )
    }

    // Crear recurso
    const resource = await prisma.resource.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        publishedAt: validatedData.status === 'published' ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error: any) {
    console.error('Error creating resource:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear recurso' },
      { status: 500 }
    )
  }
}
