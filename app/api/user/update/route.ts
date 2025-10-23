import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'

export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData
    })

    return NextResponse.json({
      message: 'Perfil actualizado correctamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
