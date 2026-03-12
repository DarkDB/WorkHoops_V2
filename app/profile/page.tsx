import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPlanLabel } from '@/lib/entitlements'
import { 
  User, 
  Mail, 
  Calendar,
  Edit,
  Shield,
  Crown,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      applications: true,
      favorites: true,
      opportunities: true,
      organizations: true,
      talentProfile: true,
      coachProfile: true
    }
  })

  if (!user) {
    redirect('/auth/login')
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      jugador: 'Jugador',
      entrenador: 'Entrenador',
      club: 'Club',
      agencia: 'Agencia',
      admin: 'Administrador'
    }
    return labels[role] || role
  }

  const isPlayer = user.role === 'jugador'
  const isCoach = user.role === 'entrenador'
  const inReviewCount = user.applications.filter((app) => app.state === 'en_revision').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <Link href="/profile/edit">
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Editar perfil
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-workhoops-accent to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-bold text-gray-900">{user.name || 'Usuario'}</h2>
                      {user.verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>

                  {user.role === 'admin' && (
                    <div className="flex items-center text-gray-700">
                      <Shield className="w-5 h-5 mr-3 text-orange-500" />
                      <span className="text-orange-600 font-medium">Administrador del sistema</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Plan actual</h3>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-workhoops-accent" />
                      <span className="font-semibold text-gray-900">{getPlanLabel(user.planType, user.role)}</span>
                    </div>
                    {user.planEnd && (
                      <p className="text-sm text-gray-500 mt-1">
                        Válido hasta {new Date(user.planEnd).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-workhoops-accent">{user.applications.length}</p>
                    <p className="text-sm text-gray-600 mt-1">{isCoach ? 'Procesos' : 'Aplicaciones'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-workhoops-accent">{user.favorites.length}</p>
                    <p className="text-sm text-gray-600 mt-1">{isCoach ? 'Guardadas' : 'Favoritos'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-workhoops-accent">{inReviewCount}</p>
                    <p className="text-sm text-gray-600 mt-1">En revisión</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Player Profile Section */}
            {isPlayer && user.talentProfile && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Perfil de Jugador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.talentProfile.position && (
                      <div>
                        <p className="text-sm text-gray-500">Posición</p>
                        <p className="font-medium">{user.talentProfile.position}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {user.talentProfile.height && (
                        <div>
                          <p className="text-sm text-gray-500">Altura</p>
                          <p className="font-medium">{user.talentProfile.height} cm</p>
                        </div>
                      )}
                      {user.talentProfile.weight && (
                        <div>
                          <p className="text-sm text-gray-500">Peso</p>
                          <p className="font-medium">{user.talentProfile.weight} kg</p>
                        </div>
                      )}
                    </div>

                    {user.talentProfile.bio && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Biografía</p>
                        <p className="text-sm text-gray-700">{user.talentProfile.bio}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Disponibilidad</p>
                      <p className="text-sm text-gray-700">{user.talentProfile.availabilityStatus}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href="/profile/complete">
                        <Button variant="outline" size="sm">
                          Editar perfil de jugador
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coach Profile Section */}
            {isCoach && user.coachProfile && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Perfil de Entrenador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nivel actual</p>
                        <p className="font-medium">{user.coachProfile.currentLevel || 'No definido'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experiencia</p>
                        <p className="font-medium">
                          {user.coachProfile.totalExperience !== null && user.coachProfile.totalExperience !== undefined
                            ? `${user.coachProfile.totalExperience} años`
                            : 'No definida'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Objetivo profesional</p>
                      <p className="font-medium">{user.coachProfile.currentGoal || 'No definido'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Disponibilidad</p>
                      <p className="font-medium">{user.coachProfile.availability || 'No definida'}</p>
                    </div>

                    {user.coachProfile.bio && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Biografía</p>
                        <p className="text-sm text-gray-700">{user.coachProfile.bio}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Link href="/profile/complete">
                        <Button variant="outline" size="sm">
                          Editar perfil de entrenador
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {((isPlayer && !user.talentProfile) || (isCoach && !user.coachProfile)) && (
              <Card className="mt-6 bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isCoach ? 'Completa tu perfil de entrenador' : 'Completa tu perfil de jugador'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isCoach
                      ? 'Configura tu experiencia, disponibilidad y objetivo profesional.'
                      : 'Crea tu perfil deportivo para ser descubierto por clubes.'}
                  </p>
                  <Link href="/profile/complete">
                    <Button size="sm">
                      {isCoach ? 'Crear perfil de entrenador' : 'Crear perfil de jugador'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mejora tu plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Accede a funciones premium y destaca entre la competencia
                </p>
                <Link href="/planes">
                  <Button className="w-full">
                    Ver planes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    Ver dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/applications">
                  <Button variant="outline" className="w-full justify-start">
                    {isCoach ? 'Mis procesos' : 'Mis aplicaciones'}
                  </Button>
                </Link>
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    {isCoach ? 'Guardadas' : 'Mis favoritos'}
                  </Button>
                </Link>
                {(isPlayer || isCoach) && (
                  <Link href="/profile/complete">
                    <Button variant="outline" className="w-full justify-start">
                      {isCoach ? 'Perfil de entrenador' : 'Perfil de jugador'}
                    </Button>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50">
                      <Shield className="w-4 h-4 mr-2" />
                      Panel de Admin
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
