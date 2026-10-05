import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Retired utility: bulk publication cannot infer consent from a private profile.
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    // Solo permitir a admins
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Esta utilidad de publicación masiva ha sido retirada.'
    }, { status: 410 })
  } catch (error) {
    console.error('Error fixing public profiles:', error)
    return NextResponse.json({
      error: 'Error al comprobar autorización'
    }, { status: 500 })
  }
}
