import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      profile: talentProfile
    })

  } catch (error) {
    console.error('Error fetching talent profile:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
