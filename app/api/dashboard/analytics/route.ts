import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Stats básicas según el rol del usuario
    let analytics: any = {
      role: userRole,
    }

    if (userRole === 'club' || userRole === 'agencia') {
      // Analytics para clubs y agencias
      const opportunities = await prisma.opportunity.findMany({
        where: { authorId: userId },
        include: {
          applications: true,
        },
      })

      const totalOpportunities = opportunities.length
      const activeOpportunities = opportunities.filter(o => o.status === 'publicada').length
      const totalApplications = opportunities.reduce((sum, o) => sum + o.applications.length, 0)

      // Aplicaciones por estado
      const applicationsByState = {
        pending: 0,
        viewed: 0,
        accepted: 0,
        rejected: 0,
      }

      opportunities.forEach(opp => {
        opp.applications.forEach(app => {
          // Map Spanish enum values to English keys
          if (app.state === 'pendiente' || app.state === 'en_revision') {
            applicationsByState.pending++
          } else if (app.state === 'vista') {
            applicationsByState.viewed++
          } else if (app.state === 'aceptada') {
            applicationsByState.accepted++
          } else if (app.state === 'rechazada') {
            applicationsByState.rejected++
          }
        })
      })

      // Tasa de respuesta
      const responseRate = totalApplications > 0
        ? ((applicationsByState.viewed + applicationsByState.accepted + applicationsByState.rejected) / totalApplications * 100).toFixed(1)
        : '0'

      // Oportunidad más popular
      const mostPopular = opportunities.length > 0
        ? opportunities.reduce((max, opp) => 
            opp.applications.length > max.applications.length ? opp : max
          )
        : null

      analytics = {
        ...analytics,
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        applicationsByState,
        responseRate: parseFloat(responseRate),
        mostPopular: mostPopular ? {
          title: mostPopular.title,
          applications: mostPopular.applications.length,
        } : null,
      }

    } else if (userRole === 'jugador' || userRole === 'entrenador') {
      // Analytics para jugadores y entrenadores
      const applications = await prisma.application.findMany({
        where: { userId },
        include: {
          opportunity: true,
        },
      })

      const totalApplications = applications.length
      const pendingApplications = applications.filter(a => a.state === 'pending').length
      const acceptedApplications = applications.filter(a => a.state === 'accepted').length
      const rejectedApplications = applications.filter(a => a.state === 'rejected').length
      const viewedApplications = applications.filter(a => a.state === 'viewed').length

      // Tasa de éxito
      const successRate = totalApplications > 0
        ? (acceptedApplications / totalApplications * 100).toFixed(1)
        : '0'

      // Favoritos
      const favoritesCount = await prisma.favorite.count({
        where: { userId },
      })

      // Perfil visto (simulado - esto se puede implementar con un sistema de vistas real)
      const profileViews = Math.floor(Math.random() * 50) + 10 // Placeholder

      analytics = {
        ...analytics,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        viewedApplications,
        successRate: parseFloat(successRate),
        favoritesCount,
        profileViews,
      }

    } else {
      // Rol no soportado o admin
      analytics = {
        ...analytics,
        message: 'Analytics no disponible para este rol',
      }
    }

    return NextResponse.json(analytics)

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener analytics',
        role: 'unknown',
        totalOpportunities: 0,
        totalApplications: 0,
      },
      { status: 500 }
    )
  }
}
