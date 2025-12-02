import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import DashboardClubAgency from '@/components/DashboardClubAgency'
import { DashboardAnalytics } from '@/components/DashboardAnalytics'
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
  Users,
  Bell,
  X,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Redirect admin to admin dashboard
  if (session.user.role === 'admin') {
    redirect('/admin')
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
      talentProfile: {
        include: {
          interestNotifications: {
            include: {
              interestedUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      coachProfile: true,
      clubAgencyProfile: true,
      opportunities: {
        include: {
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Redirect to profile completion based on role
  if (user.role === 'jugador' && !user.talentProfile) {
    redirect('/profile/complete')
  }
  
  if (user.role === 'entrenador' && !user.coachProfile) {
    redirect('/profile/complete')
  }
  
  if ((user.role === 'club' || user.role === 'agencia') && !user.clubAgencyProfile) {
    redirect('/profile/complete')
  }

  // Calculate profile completion using stored database values
  const calculateProfileCompletion = () => {
    const missingItems: string[] = []
    let percentage = 0
    
    // For players (jugador), use TalentProfile completion percentage
    if (user.role === 'jugador') {
      if (user.talentProfile) {
        percentage = user.talentProfile.profileCompletionPercentage || 0
        
        // Identify missing critical fields
        if (!user.talentProfile.fullName) missingItems.push('Nombre completo')
        if (!user.talentProfile.birthDate) missingItems.push('Fecha de nacimiento')
        if (!user.talentProfile.city) missingItems.push('Ciudad')
        if (!user.talentProfile.position) missingItems.push('Posición')
        if (!user.talentProfile.bio) missingItems.push('Biografía')
        if (!user.talentProfile.videoUrl) missingItems.push('Video destacado')
        if (!user.talentProfile.currentGoal) missingItems.push('Objetivo actual')
        if (!user.talentProfile.height) missingItems.push('Altura')
        if (!user.talentProfile.weight) missingItems.push('Peso')
      } else {
        missingItems.push('Completar perfil de jugador')
      }
    }
    
    // For coaches (entrenador), use CoachProfile completion percentage
    else if (user.role === 'entrenador') {
      if (user.coachProfile) {
        percentage = user.coachProfile.profileCompletionPercentage || 0
        
        // Identify missing critical fields
        if (!user.coachProfile.fullName) missingItems.push('Nombre completo')
        if (!user.coachProfile.city) missingItems.push('Ciudad')
        if (!user.coachProfile.totalExperience) missingItems.push('Años de experiencia')
        if (!user.coachProfile.currentLevel) missingItems.push('Nivel actual')
        if (!user.coachProfile.bio) missingItems.push('Biografía')
        if (!user.coachProfile.videoUrl) missingItems.push('Video de presentación')
        if (!user.coachProfile.currentGoal) missingItems.push('Objetivo actual')
        if (!user.coachProfile.achievements) missingItems.push('Logros')
      } else if (user.talentProfile) {
        // Legacy: Coach might have talentProfile instead
        percentage = user.talentProfile.profileCompletionPercentage || 0
        if (!user.talentProfile.fullName) missingItems.push('Nombre completo')
        if (!user.talentProfile.city) missingItems.push('Ciudad')
        if (!user.talentProfile.bio) missingItems.push('Biografía')
        if (!user.talentProfile.videoUrl) missingItems.push('Video destacado')
      } else {
        missingItems.push('Completar perfil de entrenador')
      }
    }
    
    // For clubs and agencies
    else if (user.role === 'club' || user.role === 'agencia') {
      if (user.clubAgencyProfile) {
        percentage = user.clubAgencyProfile.profileCompletionPercentage || 0
        
        // Identify missing critical fields
        if (!user.clubAgencyProfile.legalName) missingItems.push('Nombre legal')
        if (!user.clubAgencyProfile.entityType) missingItems.push('Tipo de entidad')
        if (!user.clubAgencyProfile.city) missingItems.push('Ciudad')
        if (!user.clubAgencyProfile.contactEmail) missingItems.push('Email de contacto')
        if (!user.clubAgencyProfile.description) missingItems.push('Descripción')
        if (!user.clubAgencyProfile.logo) missingItems.push('Logo')
        if (!user.clubAgencyProfile.profilesNeeded) missingItems.push('Perfiles buscados')
      } else {
        missingItems.push('Completar perfil de club/agencia')
      }
    }
    
    // Generic user fields
    if (!user.name) missingItems.push('Nombre de usuario')
    if (!user.image) missingItems.push('Foto de perfil')
    
    return {
      percentage,
      missing: missingItems
    }
  }
  
  const profileCompletion = calculateProfileCompletion()
  
  // Check if user needs to complete talent profile
  const needsTalentProfile = (user.role === 'jugador' || user.role === 'entrenador') && !user.talentProfile
  
  // Check if user is club/agency
  const isClubOrAgency = user.role === 'club' || user.role === 'agencia'

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
              {(user.role === 'jugador' || user.role === 'entrenador') && (
                <Link href="/profile/complete">
                  <Button variant="outline" className="border-workhoops-accent text-workhoops-accent hover:bg-orange-50">
                    <User className="w-4 h-4 mr-2" />
                    {user.talentProfile ? 'Editar perfil' : 'Completar perfil'}
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Cuenta
                </Button>
              </Link>
            </div>
          </div>
          
          {profileCompletion.percentage < 100 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Completa tu perfil ({profileCompletion.percentage}%)
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {needsTalentProfile 
                      ? 'Completa tu perfil de talento para recibir más oportunidades' 
                      : 'Un perfil completo recibe 3x más visualizaciones'}
                  </p>
                </div>
                <Link href={needsTalentProfile ? '/profile/complete' : '/profile/edit'}>
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                    {needsTalentProfile ? 'Completar perfil' : 'Completar'}
                  </Button>
                </Link>
              </div>
              <div className="mb-3 bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-workhoops-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion.percentage}%` }}
                />
              </div>
              {profileCompletion.missing.length > 0 && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800 mb-2">Pendiente de completar:</p>
                  <ul className="space-y-1">
                    {profileCompletion.missing.slice(0, 5).map((item, index) => (
                      <li key={index} className="text-xs text-yellow-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                    {profileCompletion.missing.length > 5 && (
                      <li className="text-xs text-yellow-600 italic">
                        ...y {profileCompletion.missing.length - 5} más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-workhoops-accent" />
            Tu Actividad
          </h2>
          <DashboardAnalytics />
        </div>

        {/* Conditional Dashboard based on user role */}
        {isClubOrAgency ? (
          <DashboardClubAgency 
            userName={user.name || 'Usuario'}
            opportunities={user.opportunities}
            totalApplications={user.opportunities.reduce((sum, opp) => sum + opp._count.applications, 0)}
          />
        ) : (
          <>
        {/* Interest Notifications - Only for players/coaches with talent profile */}
        {user.talentProfile && user.talentProfile.interestNotifications && user.talentProfile.interestNotifications.length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-900">Notificaciones de interés</span>
                </CardTitle>
                <Badge className="bg-orange-600 text-white">
                  {user.talentProfile.interestNotifications.filter(n => n.status === 'pending').length} nuevas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.talentProfile.interestNotifications.map((notification) => (
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
                          Ha mostrado interés en tu perfil. Activa el Plan Pro para recibir contacto directo.
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
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-orange-100">
                      <Link href="/planes" className="flex-1">
                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          <Star className="w-3 h-3 mr-2" />
                          Activar Plan Pro
                        </Button>
                      </Link>
                      <form action={async () => {
                        'use server'
                        await prisma.interestNotification.update({
                          where: { id: notification.id },
                          data: { status: 'dismissed' }
                        })
                      }}>
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
        </>
        )}
      </div>
    </div>
  )
}