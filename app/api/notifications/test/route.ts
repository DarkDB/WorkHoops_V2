import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// Endpoint temporal para testing de notificaciones
// Solo para desarrollo - eliminar en producción
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Crear notificación de prueba
    await createNotification({
      userId: session.user.id,
      type: 'application_received',
      title: '🧪 Notificación de Prueba',
      message: 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
      link: '/dashboard',
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Notificación de prueba creada. Recarga la página para verla.' 
    })
  } catch (error: any) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Error al crear notificación de prueba', details: error.message },
      { status: 500 }
    )
  }
}
