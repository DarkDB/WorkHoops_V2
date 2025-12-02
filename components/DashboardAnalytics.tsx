'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Briefcase,
  Heart,
  Trophy,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Analytics {
  role: string
  // Club/Agencia
  totalOpportunities?: number
  activeOpportunities?: number
  totalApplications?: number
  applicationsByState?: {
    pending: number
    viewed: number
    accepted: number
    rejected: number
  }
  responseRate?: number
  mostPopular?: {
    title: string
    applications: number
  } | null
  // Jugador/Entrenador
  pendingApplications?: number
  acceptedApplications?: number
  rejectedApplications?: number
  viewedApplications?: number
  successRate?: number
  favoritesCount?: number
  profileViews?: number
}

export function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/dashboard/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  // Renderizado para Clubs/Agencias
  if (analytics.role === 'club' || analytics.role === 'agencia') {
    return (
      <div className="space-y-6">
        {/* Stats principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ofertas Publicadas
              </CardTitle>
              <Briefcase className="w-4 h-4 text-workhoops-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalOpportunities || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.activeOpportunities || 0} activas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Aplicaciones
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalApplications || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                candidatos interesados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa de Respuesta
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.responseRate || 0}%
              </div>
              <Progress value={analytics.responseRate || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendientes
              </CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.applicationsByState?.pending || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                por revisar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desglose de aplicaciones */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado de Aplicaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Pendientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analytics.applicationsByState?.pending || 0}</span>
                  <Progress 
                    value={(analytics.applicationsByState?.pending || 0) / (analytics.totalApplications || 1) * 100} 
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Vistas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analytics.applicationsByState?.viewed || 0}</span>
                  <Progress 
                    value={(analytics.applicationsByState?.viewed || 0) / (analytics.totalApplications || 1) * 100} 
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Aceptadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analytics.applicationsByState?.accepted || 0}</span>
                  <Progress 
                    value={(analytics.applicationsByState?.accepted || 0) / (analytics.totalApplications || 1) * 100} 
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Rechazadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analytics.applicationsByState?.rejected || 0}</span>
                  <Progress 
                    value={(analytics.applicationsByState?.rejected || 0) / (analytics.totalApplications || 1) * 100} 
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {analytics.mostPopular && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Oferta Más Popular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {analytics.mostPopular.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-2xl font-bold text-workhoops-accent">
                    {analytics.mostPopular.applications}
                  </span>
                  <span className="text-sm">aplicaciones recibidas</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Renderizado para Jugadores/Entrenadores
  if (analytics.role === 'jugador' || analytics.role === 'entrenador') {
    return (
      <div className="space-y-6">
        {/* Stats principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mis Aplicaciones
              </CardTitle>
              <Briefcase className="w-4 h-4 text-workhoops-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalApplications || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ofertas aplicadas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa de Éxito
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.successRate || 0}%
              </div>
              <Progress value={analytics.successRate || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Vistas del Perfil
              </CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.profileViews || 0}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600">
                  +12% esta semana
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Favoritos
              </CardTitle>
              <Heart className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.favoritesCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ofertas guardadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desglose de aplicaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Mis Aplicaciones</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Pendientes</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {analytics.pendingApplications || 0}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Vistas</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {analytics.viewedApplications || 0}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Aceptadas</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {analytics.acceptedApplications || 0}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Rechazadas</span>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {analytics.rejectedApplications || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
