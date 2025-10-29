import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  Lock,
  Activity,
  Target,
  Globe,
  Briefcase,
  Award,
  TrendingUp,
  Video
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
  
  // Try to find in TalentProfile first (players)
  const talentProfile = await prisma.talentProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          image: true,
          planType: true
        }
      },
      playerSkills: true
    }
  })

  // If not found, try CoachProfile
  const coachProfile = !talentProfile ? await prisma.coachProfile.findUnique({
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
  }) : null

  // If neither found or not public, return 404
  if (!talentProfile && !coachProfile) {
    notFound()
  }

  if (talentProfile && !talentProfile.isPublic) {
    notFound()
  }

  if (coachProfile && !coachProfile.isPublic) {
    notFound()
  }

  // Determine which profile to use
  const profile = talentProfile || coachProfile
  const isCoach = !!coachProfile
  
  if (!profile) {
    notFound()
  }

  const canContact = profile.user.planType === 'pro_semipro' || profile.user.planType === 'destacado'

  const calculateAge = (birthDate?: Date | null, birthYear?: number | null) => {
    if (birthDate) {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }
    if (birthYear) {
      return new Date().getFullYear() - birthYear
    }
    return null
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
      Base: 'Base',
      escolta: 'Escolta',
      Escolta: 'Escolta',
      alero: 'Alero',
      Alero: 'Alero',
      'ala-pivot': 'Ala-Pívot',
      'Ala-pívot': 'Ala-Pívot',
      pivot: 'Pívot',
      Pívot: 'Pívot'
    }
    return labels[position] || position
  }

  const getSkillLabel = (skill: string) => {
    const labels: Record<string, string> = {
      threePointShot: 'Tiro exterior',
      midRangeShot: 'Tiro media distancia',
      finishing: 'Finalización',
      ballHandling: 'Manejo de balón',
      playmaking: 'Visión de juego',
      offBallMovement: 'Juego sin balón',
      individualDefense: 'Defensa individual',
      teamDefense: 'Defensa en equipo',
      offensiveRebound: 'Rebote ofensivo',
      defensiveRebound: 'Rebote defensivo',
      speed: 'Velocidad',
      athleticism: 'Capacidad atlética',
      endurance: 'Resistencia',
      leadership: 'Liderazgo',
      decisionMaking: 'Toma de decisiones'
    }
    return labels[skill] || skill
  }

  const getSkillColor = (value: number) => {
    if (value >= 4) return 'bg-green-500'
    if (value >= 3) return 'bg-blue-500'
    return 'bg-gray-400'
  }

  // Parse JSON fields safely
  const parseJsonField = (field: string | null): string[] => {
    if (!field) return []
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const playingStyles = parseJsonField(profile.playingStyle)
  const languages = parseJsonField(profile.languages)
  const photoUrls = parseJsonField(profile.photoUrls)

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
            {/* Header Card */}
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
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="mb-2">
                        {getRoleLabel(profile.role)}
                      </Badge>
                      {profile.currentLevel && (
                        <Badge className="bg-orange-100 text-orange-800 mb-2">
                          {profile.currentLevel}
                        </Badge>
                      )}
                    </div>
                    {profile.position && (
                      <p className="text-sm text-gray-600">
                        {getPositionLabel(profile.position)}
                        {profile.secondaryPosition && profile.secondaryPosition !== 'none' && (
                          <span> / {getPositionLabel(profile.secondaryPosition)}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Datos básicos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                  {profile.wingspan && (
                    <div className="flex items-center text-gray-700">
                      <Activity className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">Envergadura: {profile.wingspan} cm</span>
                    </div>
                  )}
                  {profile.dominantHand && (
                    <div className="flex items-center text-gray-700">
                      <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">Mano: {profile.dominantHand}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player Skills */}
            {profile.role === 'jugador' && profile.playerSkills && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-workhoops-accent" />
                    Habilidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Offensive Skills */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Ofensivas</h4>
                      <div className="space-y-2">
                        {['threePointShot', 'midRangeShot', 'finishing', 'ballHandling', 'playmaking', 'offBallMovement'].map((skill) => {
                          const value = profile.playerSkills![skill as keyof typeof profile.playerSkills] as number
                          return (
                            <div key={skill} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{getSkillLabel(skill)}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={value * 20} className="w-24 h-2" />
                                <span className="text-sm font-medium text-gray-900 w-8">{value}/5</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Defensive Skills */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Defensivas</h4>
                      <div className="space-y-2">
                        {['individualDefense', 'teamDefense', 'offensiveRebound', 'defensiveRebound'].map((skill) => {
                          const value = profile.playerSkills![skill as keyof typeof profile.playerSkills] as number
                          return (
                            <div key={skill} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{getSkillLabel(skill)}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={value * 20} className="w-24 h-2" />
                                <span className="text-sm font-medium text-gray-900 w-8">{value}/5</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Physical & Mental */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Físico y Mental</h4>
                      <div className="space-y-2">
                        {['speed', 'athleticism', 'endurance', 'leadership', 'decisionMaking'].map((skill) => {
                          const value = profile.playerSkills![skill as keyof typeof profile.playerSkills] as number
                          return (
                            <div key={skill} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{getSkillLabel(skill)}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={value * 20} className="w-24 h-2" />
                                <span className="text-sm font-medium text-gray-900 w-8">{value}/5</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Info */}
            {(profile.lastTeam || profile.currentCategory || profile.currentGoal) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-workhoops-accent" />
                    Trayectoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.lastTeam && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Último equipo</p>
                      <p className="text-gray-900">{profile.lastTeam}</p>
                    </div>
                  )}
                  {profile.currentCategory && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Categoría actual</p>
                      <p className="text-gray-900">{profile.currentCategory}</p>
                    </div>
                  )}
                  {profile.currentGoal && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Objetivo actual</p>
                      <p className="text-gray-900">{profile.currentGoal}</p>
                    </div>
                  )}
                  {profile.internationalExperience && (
                    <div className="pt-2">
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="w-3 h-3 mr-1" />
                        Experiencia internacional
                      </Badge>
                    </div>
                  )}
                  {profile.hasLicense && (
                    <div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Licencia federativa
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Playing Style & Additional Info */}
            {(playingStyles.length > 0 || languages.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-workhoops-accent" />
                    Estilo y Preferencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playingStyles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Estilo de juego</p>
                      <div className="flex flex-wrap gap-2">
                        {playingStyles.map((style: string) => (
                          <Badge key={style} variant="outline" className="bg-orange-50">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {languages.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Idiomas</p>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang: string) => (
                          <Badge key={lang} variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.weeklyCommitment && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Disponibilidad semanal</p>
                      <p className="text-gray-900">{profile.weeklyCommitment} horas/semana</p>
                    </div>
                  )}
                  {profile.willingToTravel && (
                    <div>
                      <Badge className="bg-purple-100 text-purple-800">
                        <MapPin className="w-3 h-3 mr-1" />
                        Disponible para viajar
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Videos & Media */}
            {(profile.videoUrl || profile.fullGameUrl || photoUrls.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="w-5 h-5 mr-2 text-workhoops-accent" />
                    Videos y Multimedia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.videoUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Video de highlights</p>
                      <a 
                        href={profile.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-workhoops-accent hover:underline"
                      >
                        <Youtube className="w-5 h-5 mr-2" />
                        Ver video destacado
                      </a>
                    </div>
                  )}
                  {profile.fullGameUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Partido completo</p>
                      <a 
                        href={profile.fullGameUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-workhoops-accent hover:underline"
                      >
                        <Youtube className="w-5 h-5 mr-2" />
                        Ver partido completo
                      </a>
                    </div>
                  )}
                  {profile.socialUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Redes sociales</p>
                      <a 
                        href={profile.socialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-workhoops-accent hover:underline"
                      >
                        <Instagram className="w-5 h-5 mr-2" />
                        Ver perfil social
                      </a>
                    </div>
                  )}
                  {photoUrls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Galería de fotos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {photoUrls.slice(0, 6).map((url: string, idx: number) => (
                          <img 
                            key={idx}
                            src={url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Links - keep for backwards compatibility */}
            {!profile.videoUrl && !profile.fullGameUrl && (profile.videoUrl || profile.socialUrl) && (
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
                  profileName={profile.fullName}
                  canContact={canContact}
                  isLoggedIn={!!session}
                  userRole={session?.user?.role}
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
