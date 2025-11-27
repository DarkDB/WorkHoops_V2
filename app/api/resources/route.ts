import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Listar recursos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (status && status !== 'all') {
      where.status = status
    } else {
      const session = await getServerSession(authOptions)
      if (!session || session.user?.role !== 'admin') {
        where.status = 'published'
      }
    }

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
      }),
      prisma.resource.count({ where })
    ])

    return NextResponse.json({
      resources,
      total,
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Error al obtener recursos' },
      { status: 500 }
    )
  }
}

// POST - Crear recurso
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

    // Verificar slug único
    const existing = await prisma.resource.findUnique({
      where: { slug: body.slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un recurso con este slug' },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        status: body.status,
        featured: body.featured || false,
        featuredImage: body.featuredImage || null,
        author: body.author,
        readTime: body.readTime || 5,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        userId: session.user.id,
        publishedAt: body.status === 'published' ? new Date() : null,
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
    return NextResponse.json(
      { error: 'Error al crear recurso' },
      { status: 500 }
    )
  }
}
