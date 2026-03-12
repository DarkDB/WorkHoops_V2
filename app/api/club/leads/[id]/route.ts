import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'CONTACTED', 'REJECTED'])
})

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'club' && session.user.role !== 'agencia' && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateLeadSchema.parse(body)

    const existingLead = await prisma.clubLead.findUnique({
      where: { id: context.params.id },
      select: { id: true, clubUserId: true }
    })

    if (!existingLead) {
      return NextResponse.json({ message: 'Lead no encontrado' }, { status: 404 })
    }

    if (session.user.role !== 'admin' && existingLead.clubUserId !== session.user.id) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const lead = await prisma.clubLead.update({
      where: { id: context.params.id },
      data: {
        status: validated.status
      },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ lead })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }

    console.error('Error updating club lead:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
