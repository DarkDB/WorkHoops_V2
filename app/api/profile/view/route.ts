import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileUserId, profileType } = body as {
      profileUserId: string
      profileType: 'jugador' | 'entrenador'
    }

    if (!profileUserId || !profileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get session (may be null for anonymous visitors)
    const session = await getServerSession(authOptions)
    const viewerUserId = session?.user?.id || null

    // Don't count if the viewer is the profile owner
    if (viewerUserId && viewerUserId === profileUserId) {
      return NextResponse.json({ counted: false, reason: 'own_profile' })
    }

    // Get viewer IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Deduplication: same IP + same profile within 24h
    const recentView = await prisma.profileView.findFirst({
      where: {
        profileUserId,
        viewerIp: ip,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    if (recentView) {
      return NextResponse.json({ counted: false, reason: 'duplicate' })
    }

    // Save the view
    await prisma.profileView.create({
      data: {
        profileUserId,
        viewerIp: ip,
        viewerUserId,
        profileType
      }
    })

    // Count views in last 24h for this profile
    const startOf24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const viewsToday = await prisma.profileView.count({
      where: {
        profileUserId,
        createdAt: { gte: startOf24h }
      }
    })

    // Send notification at milestones: 1, 5, 10, 25, 50
    const milestones = [1, 5, 10, 25, 50]
    if (milestones.includes(viewsToday)) {
      const message =
        viewsToday === 1
          ? '¡Alguien ha visto tu perfil hoy! Completa tu perfil para destacar más.'
          : `${viewsToday} personas han visto tu perfil hoy. ¡Completa tu perfil para destacar más!`

      await createNotification({
        userId: profileUserId,
        type: 'profile_viewed',
        title: 'Tu perfil está recibiendo visitas 👀',
        message,
        link: '/dashboard'
      })
    }

    return NextResponse.json({ counted: true, viewsToday })
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
