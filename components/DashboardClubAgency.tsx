'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  FileText,
  PlusCircle,
  Calendar,
  MapPin
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  slug: string
  type: string
  city: string
  status: string
  createdAt: Date
  deadline: Date | null
  _count: {
    applications: number
  }
}

interface DashboardClubAgencyProps {
  userName: string
  opportunities: Opportunity[]
  totalApplications: number
}

export default function DashboardClubAgency({ 
  userName, 
  opportunities,
  totalApplications 
}: DashboardClubAgencyProps) {
  const activeOpportunities = opportunities.filter(opp => opp.status === 'publicada').length
  const pendingOpportunities = opportunities.filter(opp => opp.status === 'borrador').length
  const totalPublished = opportunities.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicada':
        return 'bg-green-100 text-green-800'
      case 'borrador':
        return 'bg-gray-100 text-gray-800'
      case 'cerrada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      publicada: 'Publicada',
      borrador: 'Borrador',
      cerrada: 'Cerrada'
    }
    return labels[status] || status
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empleo':
        return <Briefcase className="w-4 h-4" />
      case 'prueba':
        return <Users className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ofertas publicadas</p>
                <p className="text-3xl font-bold text-gray-900">{totalPublished}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {activeOpportunities} activas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidatos recibidos</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Total de solicitudes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vistas totales</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-purple-600">
              Próximamente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de respuesta</p>
                <p className="text-3xl font-bold text-gray-900">0%</p>
              </div>
              <div className="w-12 h-12 bg-workhoops-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-workhoops-accent" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Próximamente
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Opportunities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Mis ofertas publicadas</span>
                </CardTitle>
                <Link href="/publicar">
                  <Button size="sm" className="bg-workhoops-accent hover:bg-orange-600">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nueva oferta
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aún no has publicado ninguna oferta</p>
                    <Link href="/publicar">
                      <Button variant="outline" size="sm" className="mt-4">
                        Publicar primera oferta
                      </Button>
                    </Link>
                  </div>
                ) : (
                  opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          {getTypeIcon(opportunity.type)}
                          <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                        </div>
                        <Badge className={getStatusColor(opportunity.status)}>
                          {getStatusLabel(opportunity.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {opportunity.city}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Publicado el {new Date(opportunity.createdAt).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {opportunity._count.applications} candidatos
                          </span>
                          <Link href={`/oportunidades/${opportunity.slug}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                          <Link href={`/oportunidades/${opportunity.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/publicar" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Publicar nueva oferta
                </Button>
              </Link>
              <Link href="/talento/perfiles" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Buscar talento
                </Button>
              </Link>
              <Link href="/profile/edit" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Editar perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Consejos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">💡 Destaca tu oferta</p>
                  <p className="text-xs text-blue-700">
                    Las ofertas con descripciones detalladas reciben un 3x más candidatos
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">🎯 Responde rápido</p>
                  <p className="text-xs text-green-700">
                    Los clubs que responden en 24h tienen 5x más conversiones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
