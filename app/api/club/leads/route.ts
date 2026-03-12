import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'club' && session.user.role !== 'agencia' && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const leads = await prisma.clubLead.findMany({
      where: {
        clubUserId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fullName: true,
        age: true,
        position: true,
        height: true,
        city: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sourceUserId: true
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching club leads:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
