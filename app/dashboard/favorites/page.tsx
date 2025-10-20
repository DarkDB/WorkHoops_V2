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
  Heart,
  Briefcase,
  Award,
  Users,
  Clock,
  CheckCircle,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Fetch user's favorites from database
  const favorites = await prisma.favorite.findMany({
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'empleo':
        return 'Empleo'
      case 'prueba':
        return 'Prueba'
      case 'torneo':
        return 'Torneo'
      case 'clinica':
        return 'Clínica'
      case 'beca':
        return 'Beca'
      default:
        return type
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'empleo':
        return 'bg-blue-100 text-blue-800'
      case 'prueba':
        return 'bg-green-100 text-green-800'
      case 'torneo':
        return 'bg-purple-100 text-purple-800'
      case 'clinica':
        return 'bg-orange-100 text-orange-800'
      case 'beca':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const daysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500" />
                Mis Favoritos
              </h1>
              <p className="text-gray-600 mt-1">
                Oportunidades que has marcado como favoritas
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              {favorites.length} oportunidades guardadas
            </div>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Explora oportunidades y marca como favoritas las que más te interesen
              </p>
              <Link href="/oportunidades">
                <Button>
                  Explorar oportunidades
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Favorites List */}
        {favorites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(favorite.opportunity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getTypeColor(favorite.opportunity.type)}>
                              {getTypeLabel(favorite.opportunity.type)}
                            </Badge>
                            {favorite.opportunity.verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verificada
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {favorite.opportunity.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{favorite.opportunity.organization?.name || 'Organización'}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {favorite.opportunity.city || favorite.opportunity.country}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              Guardado el {new Date(favorite.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <form action={`/api/favorites`} method="DELETE">
                          <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {favorite.opportunity.deadline && daysUntilDeadline(favorite.opportunity.deadline.toISOString()) > 0 ? (
                          <div className="flex items-center text-orange-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {daysUntilDeadline(favorite.opportunity.deadline.toISOString())} días para aplicar
                          </div>
                        ) : favorite.opportunity.deadline ? (
                          <div className="flex items-center text-red-600">
                            <Clock className="w-4 h-4 mr-1" />
                            Plazo cerrado
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            Sin plazo definido
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/oportunidades/${favorite.opportunity.slug}`}>
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </Link>
                        {favorite.opportunity.deadline && daysUntilDeadline(favorite.opportunity.deadline.toISOString()) > 0 && (
                          <Button size="sm">
                            Aplicar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Consejos para aprovechar tus favoritos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Revisa regularmente tus favoritos para no perder oportunidades</li>
              <li>• Configura alertas para recibir notificaciones de plazos de cierre</li>
              <li>• Organiza tus favoritos por fecha límite para priorizar aplicaciones</li>
              <li>• Aplica cuanto antes - muchas oportunidades se llenan rápidamente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}