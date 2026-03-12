import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  category: z.string().min(2),
  enabled: z.boolean(),
  frequency: z.enum(['immediate', 'daily', 'weekly']).optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const preferences = await prisma.emailPreference.findMany({
      where: { userId: session.user.id },
      orderBy: { category: 'asc' }
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)

    const preference = await prisma.emailPreference.upsert({
      where: {
        userId_category: {
          userId: session.user.id,
          category: validated.category
        }
      },
      update: {
        enabled: validated.enabled,
        frequency: validated.frequency || 'immediate'
      },
      create: {
        userId: session.user.id,
        category: validated.category,
        enabled: validated.enabled,
        frequency: validated.frequency || 'immediate'
      }
    })

    return NextResponse.json({ preference })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    console.error('Error updating email preference:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
