import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Briefcase,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Star,
  User,
  Users,
  X
} from 'lucide-react'

type ApplicationItem = {
  id: string
  state: string
  createdAt: Date
  opportunity: {
    title: string
    type: string
    slug: string
    city: string | null
    country: string
    organization: {
      name: string
    } | null
  }
}

type RecommendationItem = {
  id: string
  title: string
  type: string
  slug: string
  city: string | null
  deadline: Date | null
  organization: {
    name: string
  } | null
}

type InterestNotificationItem = {
  id: string
  status: string
  createdAt: Date
  interestedUser: {
    name: string | null
    role: string
  }
}

interface PlayerDashboardProps {
  applications: ApplicationItem[]
  recommendations: RecommendationItem[]
  interestNotifications: InterestNotificationItem[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aceptada':
      return 'bg-green-100 text-green-800'
    case 'en_revision':
      return 'bg-blue-100 text-blue-800'
    case 'rechazada':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    enviada: 'Enviada',
    en_revision: 'En revisión',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    finalizada: 'Finalizada'
  }
  return labels[status] || status
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'empleo':
      return <Briefcase className="w-4 h-4" />
    case 'prueba':
      return <Star className="w-4 h-4" />
    case 'torneo':
    case 'clinica':
      return <Users className="w-4 h-4" />
    default:
      return <Star className="w-4 h-4" />
  }
}

export default function PlayerDashboard({ applications, recommendations, interestNotifications }: PlayerDashboardProps) {
  const pendingNotifications = interestNotifications.filter((item) => item.status === 'pending').length

  return (
    <>
      {interestNotifications.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="text-orange-900">Interés en tu perfil</span>
              </CardTitle>
              <Badge className="bg-orange-600 text-white">{pendingNotifications} nuevas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interestNotifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        <p className="font-medium text-gray-900">
                          {notification.interestedUser.name || 'Un usuario'}
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            ({notification.interestedUser.role === 'club' ? 'Club' : 'Agencia'})
                          </span>
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        Han mostrado interés en tu perfil. Revisa tus invitaciones y mantén tu disponibilidad activa.
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {notification.status === 'pending' && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">Nuevo</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-orange-100">
                    <Link href="/oportunidades" className="flex-1">
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        <Star className="w-3 h-3 mr-2" />
                        Ver oportunidades
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await prisma.interestNotification.update({
                          where: { id: notification.id },
                          data: { status: 'dismissed' }
                        })
                      }}
                    >
                      <Button type="submit" variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Tus aplicaciones recientes</span>
                </CardTitle>
                <Link href="/dashboard/applications">
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aún no has enviado aplicaciones</p>
                    <Link href="/oportunidades">
                      <Button variant="outline" size="sm" className="mt-4">
                        Explorar oportunidades
                      </Button>
                    </Link>
                  </div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(application.opportunity.type)}
                          <h3 className="font-medium text-gray-900">{application.opportunity.title}</h3>
                        </div>
                        <Badge className={getStatusColor(application.state)}>{getStatusLabel(application.state)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {application.opportunity.organization?.name || 'Organización'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Aplicado el {new Date(application.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Recomendado para jugador</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No hay recomendaciones por ahora</p>
                  </div>
                ) : (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(rec.type)}
                        <h3 className="font-medium text-gray-900 text-sm">{rec.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.organization?.name || 'Organización'}</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {rec.city || 'España'}
                        </div>
                        {rec.deadline && (
                          <div className="flex items-center text-xs text-orange-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Cierra {new Date(rec.deadline).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>
                      <Link href={`/oportunidades/${rec.slug}`}>
                        <Button size="sm" className="w-full mt-3">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/oportunidades">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Explorar oportunidades
                  </Button>
                </Link>
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Ver mis favoritos
                  </Button>
                </Link>
                <Link href="/profile/complete">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Completar perfil jugador
                  </Button>
                </Link>
                <Link href="/dashboard/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Preferencias de email
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
