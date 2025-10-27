import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Count user's opportunities (borrador + publicada)
    const count = await prisma.opportunity.count({
      where: {
        authorId: session.user.id,
        status: { in: ['borrador', 'publicada'] }
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting opportunities:', error)
    return NextResponse.json(
      { error: 'Error al obtener el conteo' },
      { status: 500 }
    )
  }
}
