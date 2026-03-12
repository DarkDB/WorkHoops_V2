import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  GraduationCap,
  Bell,
  CheckCircle2
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

interface CoachDashboardProps {
  applications: ApplicationItem[]
  recommendations: RecommendationItem[]
  coachProfile: {
    currentGoal: string | null
    availability: string | null
    currentLevel: string | null
  } | null
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

export default function CoachDashboard({ applications, recommendations, coachProfile }: CoachDashboardProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Procesos abiertos para entrenador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aún no has aplicado a oportunidades de staff técnico</p>
                <Link href="/oportunidades">
                  <Button variant="outline" size="sm" className="mt-4">
                    Explorar ofertas para entrenador
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{application.opportunity.title}</h3>
                      <Badge className={getStatusColor(application.state)}>{getStatusLabel(application.state)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{application.opportunity.organization?.name || 'Organización'}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Aplicado el {new Date(application.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Oportunidades recomendadas para entrenador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-gray-500 text-sm">No hay recomendaciones disponibles en este momento.</div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="font-medium text-gray-900 text-sm">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.organization?.name || 'Organización'}</p>
                    <div className="mt-2 space-y-1">
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
                        Ver oportunidad
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
              <GraduationCap className="w-5 h-5" />
              Tu perfil profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Nivel actual</p>
              <p className="text-blue-900">{coachProfile?.currentLevel || 'No definido'}</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Disponibilidad</p>
              <p className="text-blue-900">{coachProfile?.availability || 'No definida'}</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Objetivo</p>
              <p className="text-blue-900">{coachProfile?.currentGoal || 'Sin objetivo configurado'}</p>
            </div>
            <Link href="/profile/complete">
              <Button variant="outline" className="w-full mt-2 border-blue-300 text-blue-900 hover:bg-blue-100">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Actualizar perfil de entrenador
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/oportunidades">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="w-4 h-4 mr-2" />
                Buscar oportunidades
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Ver mis procesos
              </Button>
            </Link>
            <Link href="/profile/complete">
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Editar perfil entrenador
              </Button>
            </Link>
            <Link href="/dashboard/notifications">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Preferencias de email
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
