import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  CheckCircle,
  Youtube,
  Instagram,
  Mail,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import ContactButton from './ContactButton'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TalentProfileDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  const profile = await prisma.talentProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          image: true,
          planType: true
        }
      }
    }
  })

  if (!profile || !profile.isPublic) {
    notFound()
  }

  const canContact = profile.user.planType === 'pro_semipro' || profile.user.planType === 'destacado'

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      jugador: 'Jugador',
      entrenador: 'Entrenador',
      staff: 'Staff Técnico'
    }
    return labels[role] || role
  }

  const getPositionLabel = (position: string | null) => {
    if (!position) return null
    const labels: Record<string, string> = {
      base: 'Base',
      escolta: 'Escolta',
      alero: 'Alero',
      'ala-pivot': 'Ala-Pívot',
      pivot: 'Pívot'
    }
    return labels[position] || position
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/talento/perfiles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a perfiles
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-workhoops-accent to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.fullName}
                      </h1>
                      {profile.verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {getRoleLabel(profile.role)}
                    </Badge>
                    {profile.position && (
                      <p className="text-sm text-gray-600">
                        {getPositionLabel(profile.position)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{calculateAge(profile.birthDate)} años</span>
                  </div>
                  {profile.height && (
                    <div className="flex items-center text-gray-700">
                      <Ruler className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{profile.height} cm</span>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="flex items-center text-gray-700">
                      <Weight className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{profile.weight} kg</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Biografía</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            {(profile.videoUrl || profile.socialUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Enlaces</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.videoUrl && (
                    <a 
                      href={profile.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-workhoops-accent hover:underline"
                    >
                      <Youtube className="w-5 h-5 mr-2" />
                      Ver vídeo destacado
                    </a>
                  )}
                  {profile.socialUrl && (
                    <a 
                      href={profile.socialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-workhoops-accent hover:underline"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      Redes sociales
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Interesado en este perfil? Contacta directamente
                </p>
                <ContactButton 
                  profileId={profile.id}
                  profileUserId={profile.user.id}
                  canContact={canContact}
                  isLoggedIn={!!session}
                />
                {!canContact && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Este usuario necesita plan Pro para recibir contactos
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg">¿Buscas talento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Explora más perfiles de jugadores y entrenadores
                </p>
                <Link href="/talento/perfiles">
                  <Button variant="outline" className="w-full">
                    Ver más perfiles
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compartir perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-2">
                  Perfil creado el {new Date(profile.createdAt).toLocaleDateString('es-ES')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
