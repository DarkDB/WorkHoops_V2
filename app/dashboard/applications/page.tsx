import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Fetch user's applications
  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      opportunity: {
        include: {
          organization: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceptada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'en_revision':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'finalizada':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aceptada':
        return <CheckCircle className="w-4 h-4" />
      case 'en_revision':
        return <Eye className="w-4 h-4" />
      case 'rechazada':
        return <XCircle className="w-4 h-4" />
      case 'finalizada':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }
        return <Eye className="w-4 h-4" />
      case 'rechazada':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empleo':
        return <Briefcase className="w-4 h-4" />
      case 'prueba':
        return <Award className="w-4 h-4" />
      case 'torneo':
      case 'clinica':
        return <Users className="w-4 h-4" />
      default:
        return <Briefcase className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      empleo: 'Empleo',
      prueba: 'Prueba',
      torneo: 'Torneo',
      clinica: 'Clínica',
      beca: 'Beca',
      patrocinio: 'Patrocinio'
    }
    return labels[type] || type
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empleo':
        return <Briefcase className="w-4 h-4" />
      case 'prueba':
        return <Award className="w-4 h-4" />
      case 'torneo':
      case 'clinica':
        return <Users className="w-4 h-4" />
      default:
        return <Briefcase className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Aplicaciones
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona todas tus solicitudes enviadas
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              Total: {applications.length} aplicaciones
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.state === 'enviada').length}
                </p>
                <p className="text-sm text-gray-600">Enviadas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.state === 'en_revision').length}
                </p>
                <p className="text-sm text-gray-600">En revisión</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.state === 'aceptada').length}
                </p>
                <p className="text-sm text-gray-600">Aceptadas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(app => app.state === 'rechazada').length}
                </p>
                <p className="text-sm text-gray-600">Rechazadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No has enviado aplicaciones aún
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Explora oportunidades y aplica a las que más te interesen
              </p>
              <Link href="/oportunidades">
                <Button>
                  Explorar oportunidades
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        {applications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Todas mis aplicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTypeIcon(application.opportunity.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {application.opportunity.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{application.opportunity.organization?.name || 'Organización'}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {application.opportunity.city || application.opportunity.country}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Aplicado el {new Date(application.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={`${getStatusColor(application.state)} flex items-center space-x-1`}>
                        {getStatusIcon(application.state)}
                        <span>{getStatusLabel(application.state)}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {application.opportunity.deadline ? (
                          <>Cierre: {new Date(application.opportunity.deadline).toLocaleDateString('es-ES')}</>
                        ) : (
                          <>Sin plazo definido</>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/oportunidades/${application.opportunity.slug}`}>
                          <Button variant="outline" size="sm">
                            Ver oferta
                          </Button>
                        </Link>
                        {application.state === 'aceptada' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Ver detalles
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}