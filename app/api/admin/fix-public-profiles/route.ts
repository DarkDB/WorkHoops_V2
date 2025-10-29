import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Endpoint temporal para corregir perfiles que no son públicos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Solo permitir a admins
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Actualizar todos los TalentProfiles para que sean públicos
    const updatedTalentProfiles = await prisma.talentProfile.updateMany({
      where: {
        isPublic: false
      },
      data: {
        isPublic: true
      }
    })

    // Actualizar todos los CoachProfiles para que sean públicos (si tienen el campo)
    // Nota: verificar si CoachProfile tiene campo isPublic

    return NextResponse.json({
      success: true,
      message: 'Perfiles actualizados correctamente',
      updatedCount: updatedTalentProfiles.count
    })
  } catch (error: any) {
    console.error('Error fixing public profiles:', error)
    return NextResponse.json({
      error: 'Error al actualizar perfiles',
      message: error.message
    }, { status: 500 })
  }
}
