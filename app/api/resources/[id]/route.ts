import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const resourceSchema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  slug: z.string().min(1, 'Slug es requerido'),
  excerpt: z.string().min(1, 'Extracto es requerido'),
  content: z.string().min(1, 'Contenido es requerido'),
  category: z.enum(['preparacion', 'carrera', 'recursos', 'salud', 'tactica', 'mental']),
  status: z.enum(['draft', 'published']),
  featured: z.boolean(),
  featuredImage: z.string().optional().nullable(),
  author: z.string().min(1, 'Autor es requerido'),
  readTime: z.number().int().positive(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

// GET - Obtener recurso individual (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Intentar buscar por ID o por slug
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
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos si está en borrador
    if (resource.status === 'draft') {
      const session = await getServerSession(authOptions)
      if (!session || session.user?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Recurso no encontrado' },
          { status: 404 }
        )
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
    return NextResponse.json(
      { error: 'Error al obtener recurso' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar recurso (solo admin)
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
    const validatedData = resourceSchema.parse(body)

    // Verificar que el recurso existe
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el slug no esté en uso por otro recurso
    if (validatedData.slug !== existingResource.slug) {
      const slugInUse = await prisma.resource.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: id }
        }
      })

      if (slugInUse) {
        return NextResponse.json(
          { error: 'Ya existe un recurso con este slug' },
          { status: 400 }
        )
      }
    }

    // Actualizar publishedAt si cambia de draft a published
    const publishedAt = validatedData.status === 'published' && existingResource.status === 'draft'
      ? new Date()
      : existingResource.publishedAt

    // Actualizar recurso
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...validatedData,
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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar recurso' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar recurso (solo admin)
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

    // Verificar que el recurso existe
    const resource = await prisma.resource.findUnique({
      where: { id }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Recurso no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar recurso
    await prisma.resource.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Recurso eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Error al eliminar recurso' },
      { status: 500 }
    )
  }
}
