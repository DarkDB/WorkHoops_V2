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
      talentProfile: true
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

  const getPlanLabel = (planType: string) => {
    const labels: Record<string, string> = {
      free_amateur: 'Free Amateur',
      pro_semipro: 'Pro Semipro',
      club_agencia: 'Club/Agencia',
      destacado: 'Destacado'
    }
    return labels[planType] || planType
  }

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
                      <span className="font-semibold text-gray-900">{getPlanLabel(user.planType)}</span>
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
                    <p className="text-sm text-gray-600 mt-1">Aplicaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-workhoops-accent">{user.favorites.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Favoritos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-workhoops-accent">{user.opportunities.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Publicadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Talent Profile Section */}
            {user.talentProfile && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Perfil de Talento</CardTitle>
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

                    <div className="pt-4 border-t">
                      <Link href="/talento#formulario">
                        <Button variant="outline" size="sm">
                          Editar perfil de talento
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!user.talentProfile && (user.role === 'jugador' || user.role === 'entrenador') && (
              <Card className="mt-6 bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Completa tu perfil de talento
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Crea tu perfil deportivo para ser descubierto por clubs y agencias
                  </p>
                  <Link href="/talento#formulario">
                    <Button size="sm">
                      Crear perfil de talento
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
                    Mis aplicaciones
                  </Button>
                </Link>
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    Mis favoritos
                  </Button>
                </Link>
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
