import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

const shortlistSchema = z.object({
  profileId: z.string().cuid(),
  status: z.enum(['SAVED', 'CONTACTED', 'INVITED', 'SIGNED', 'REJECTED']).optional()
})

const shortlistUpdateSchema = z.object({
  profileId: z.string().cuid(),
  status: z.enum(['SAVED', 'CONTACTED', 'INVITED', 'SIGNED', 'REJECTED'])
})

const roleAllowed = (role?: string) => role === 'club' || role === 'agencia' || role === 'admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (!roleAllowed(session.user.role)) {
      return NextResponse.json({ message: 'Solo clubes y agencias pueden usar shortlist' }, { status: 403 })
    }

    const profileId = request.nextUrl.searchParams.get('profileId')
    if (profileId) {
      const item = await prisma.talentShortlist.findUnique({
        where: {
          clubUserId_talentProfileId: {
            clubUserId: session.user.id,
            talentProfileId: profileId
          }
        },
        include: {
          invitations: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })
      return NextResponse.json({ item })
    }

    const items = await prisma.talentShortlist.findMany({
      where: { clubUserId: session.user.id },
      include: {
        talentProfile: {
          select: {
            id: true,
            fullName: true,
            city: true,
            country: true,
            position: true,
            currentLevel: true,
            availabilityStatus: true,
            availableFrom: true,
            height: true,
            birthDate: true,
            user: {
              select: {
                id: true,
                image: true
              }
            }
          }
        },
        invitations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching shortlist:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (!roleAllowed(session.user.role)) {
      return NextResponse.json({ message: 'Solo clubes y agencias pueden usar shortlist' }, { status: 403 })
    }

    const body = await request.json()
    const { profileId, status } = shortlistSchema.parse(body)

    const talentProfile = await prisma.talentProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        role: true,
        userId: true
      }
    })

    if (!talentProfile || talentProfile.role !== 'jugador') {
      return NextResponse.json({ message: 'Jugador no encontrado' }, { status: 404 })
    }

    const existing = await prisma.talentShortlist.findUnique({
      where: {
        clubUserId_talentProfileId: {
          clubUserId: session.user.id,
          talentProfileId: profileId
        }
      }
    })

    const nextStatus = status || 'SAVED'

    const item = await prisma.talentShortlist.upsert({
      where: {
        clubUserId_talentProfileId: {
          clubUserId: session.user.id,
          talentProfileId: profileId
        }
      },
      create: {
        clubUserId: session.user.id,
        talentProfileId: profileId,
        status: nextStatus,
        lastStatusAt: new Date()
      },
      update: {
        status: nextStatus,
        lastStatusAt: new Date()
      }
    })

    if (!existing) {
      await createNotification({
        userId: talentProfile.userId,
        type: 'profile_saved',
        title: 'Un club guardó tu perfil',
        message: `${session.user.name || 'Un club'} te añadió a su shortlist`,
        link: `/talento/perfiles/${profileId}`
      })
    }

    return NextResponse.json({ message: 'Jugador guardado en shortlist', item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    console.error('Error creating shortlist item:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (!roleAllowed(session.user.role)) {
      return NextResponse.json({ message: 'Solo clubes y agencias pueden usar shortlist' }, { status: 403 })
    }

    const body = await request.json()
    const { profileId, status } = shortlistUpdateSchema.parse(body)

    const item = await prisma.talentShortlist.update({
      where: {
        clubUserId_talentProfileId: {
          clubUserId: session.user.id,
          talentProfileId: profileId
        }
      },
      data: {
        status,
        lastStatusAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Estado actualizado', item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Elemento no encontrado en shortlist' }, { status: 404 })
    }
    console.error('Error updating shortlist status:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (!roleAllowed(session.user.role)) {
      return NextResponse.json({ message: 'Solo clubes y agencias pueden usar shortlist' }, { status: 403 })
    }

    const body = await request.json()
    const { profileId } = shortlistSchema.parse(body)

    await prisma.talentShortlist.delete({
      where: {
        clubUserId_talentProfileId: {
          clubUserId: session.user.id,
          talentProfileId: profileId
        }
      }
    })

    return NextResponse.json({ message: 'Jugador eliminado de shortlist' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Elemento no encontrado en shortlist' }, { status: 404 })
    }
    console.error('Error deleting shortlist item:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
