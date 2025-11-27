import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener recurso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const resource = await prisma.resource.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
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

    if (!resource) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    if (resource.status === 'draft') {
      const session = await getServerSession(authOptions)
      if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      }
    }

    // Incrementar vistas
    await prisma.resource.update({
      where: { id: resource.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PUT - Actualizar recurso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    const existing = await prisma.resource.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    // Verificar slug único
    if (body.slug !== existing.slug) {
      const slugInUse = await prisma.resource.findFirst({
        where: {
          slug: body.slug,
          id: { not: id }
        }
      })

      if (slugInUse) {
        return NextResponse.json(
          { error: 'Slug en uso' },
          { status: 400 }
        )
      }
    }

    const publishedAt = body.status === 'published' && existing.status === 'draft'
      ? new Date()
      : existing.publishedAt

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        status: body.status,
        featured: body.featured,
        featuredImage: body.featuredImage || null,
        author: body.author,
        readTime: body.readTime,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        publishedAt,
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

    return NextResponse.json(resource)
  } catch (error: any) {
    console.error('Error updating resource:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// DELETE - Eliminar recurso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = params

    const resource = await prisma.resource.findUnique({ where: { id } })

    if (!resource) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await prisma.resource.delete({ where: { id } })

    return NextResponse.json({ message: 'Eliminado' })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
