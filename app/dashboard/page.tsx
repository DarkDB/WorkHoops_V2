import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Briefcase, 
  Heart, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Award,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Fetch real user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: {
        include: {
          opportunity: {
            include: {
              organization: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      },
      favorites: {
        include: {
          opportunity: {
            include: {
              organization: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      talentProfile: true
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Calculate profile completion with talent profile consideration
  const calculateProfileCompletion = () => {
    let totalFields = 0
    let completedFields = 0
    
    // Basic user fields
    const basicFields = [user.name, user.email, user.role]
    totalFields += basicFields.length
    completedFields += basicFields.filter(f => f !== null && f !== '').length
    
    // Image (bonus)
    if (user.image) completedFields += 1
    totalFields += 1
    
    // For players and coaches, check talent profile completion
    if (user.role === 'jugador' || user.role === 'entrenador') {
      if (user.talentProfile) {
        // Talent profile exists - check completeness
        const profileFields = [
          user.talentProfile.fullName,
          user.talentProfile.birthDate,
          user.talentProfile.city,
          user.talentProfile.bio,
        ]
        totalFields += profileFields.length
        completedFields += profileFields.filter(f => f !== null && f !== '').length
        
        // Optional but valuable fields
        if (user.talentProfile.position) completedFields += 1
        totalFields += 1
        
        if (user.talentProfile.videoUrl) completedFields += 1
        totalFields += 1
      } else {
        // No talent profile - penalize heavily
        totalFields += 6 // Expected talent profile fields
      }
    }
    
    // Activity indicators
    if (user.applications.length > 0) completedFields += 1
    totalFields += 1
    
    if (user.favorites.length > 0) completedFields += 1
    totalFields += 1
    
    return Math.round((completedFields / totalFields) * 100)
  }
  
  const profileComplete = calculateProfileCompletion()
  
  // Check if user needs to complete talent profile
  const needsTalentProfile = (user.role === 'jugador' || user.role === 'entrenador') && !user.talentProfile

  // Get statistics
  const stats = {
    applications: user.applications.length,
    favorites: user.favorites.length,
    profileViews: 0, // TODO: Implement view tracking
    responseRate: 0 // TODO: Calculate from applications
  }

  // Get recent opportunities for recommendations
  const recommendations = await prisma.opportunity.findMany({
    where: {
      status: 'publicada',
      deadline: {
        gte: new Date()
      }
    },
    include: {
      organization: true
    },
    orderBy: { createdAt: 'desc' },
    take: 2
  })

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

  const getPlanLabel = (planType: string) => {
    const labels: Record<string, string> = {
      free_amateur: 'Free Amateur',
      pro_semipro: 'Pro Semipro',
      club_agencia: 'Club/Agencia',
      destacado: 'Destacado'
    }
    return labels[planType] || planType
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'empleo':
        return <Briefcase className="w-4 h-4" />
      case 'prueba':
        return <Award className="w-4 h-4" />
      case 'torneo':
        return <Users className="w-4 h-4" />
      case 'clinica':
        return <Users className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {user.name || 'Usuario'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Aquí tienes un resumen de tu actividad en WorkHoops
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-orange-50 text-workhoops-accent border-workhoops-accent">
                {getPlanLabel(user.planType)}
              </Badge>
              <Link href="/profile">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Ver perfil
                </Button>
              </Link>
            </div>
          </div>
          
          {profileComplete < 100 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Completa tu perfil ({profileComplete}%)
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {needsTalentProfile 
                      ? 'Completa tu perfil de talento para recibir más oportunidades' 
                      : 'Un perfil completo recibe 3x más visualizaciones'}
                  </p>
                </div>
                <Link href={needsTalentProfile ? '/talento#formulario' : '/profile/edit'}>
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                    {needsTalentProfile ? 'Completar perfil de talento' : 'Completar'}
                  </Button>
                </Link>
              </div>
              <div className="mt-2 bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-workhoops-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileComplete}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solicitudes enviadas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Total de aplicaciones
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favoritos guardados</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.favorites}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Total guardados
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vistas del perfil</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.profileViews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-green-600">
                Próximamente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de respuesta</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
                </div>
                <div className="w-12 h-12 bg-workhoops-accent/10 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-workhoops-accent" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Próximamente
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Mis solicitudes recientes</span>
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
                  {user.applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aún no has enviado ninguna solicitud</p>
                      <Link href="/oportunidades">
                        <Button variant="outline" size="sm" className="mt-4">
                          Explorar oportunidades
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    user.applications.map((application) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(application.opportunity.type)}
                            <h3 className="font-medium text-gray-900">{application.opportunity.title}</h3>
                          </div>
                          <Badge className={getStatusColor(application.state)}>
                            {getStatusLabel(application.state)}
                          </Badge>
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

          {/* Recommendations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Recomendado para ti</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No hay recomendaciones disponibles</p>
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

            {/* Quick Actions */}
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
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}