import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Endpoint de debug para verificar estado de perfiles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Solo permitir a admins
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener todos los TalentProfiles con información básica
    const allProfiles = await prisma.talentProfile.findMany({
      select: {
        id: true,
        fullName: true,
        role: true,
        isPublic: true,
        profileCompletionPercentage: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const stats = {
      total: allProfiles.length,
      public: allProfiles.filter(p => p.isPublic).length,
      private: allProfiles.filter(p => !p.isPublic).length,
      above50: allProfiles.filter(p => p.profileCompletionPercentage >= 50).length,
      publicAndAbove50: allProfiles.filter(p => p.isPublic && p.profileCompletionPercentage >= 50).length
    }

    return NextResponse.json({
      success: true,
      stats,
      profiles: allProfiles
    })
  } catch (error: any) {
    console.error('Error getting profile debug info:', error)
    return NextResponse.json({
      error: 'Error al obtener información',
      message: error.message
    }, { status: 500 })
  }
}
