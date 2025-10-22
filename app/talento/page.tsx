import Link from 'next/link'
import { ArrowRight, Star, Users, Trophy, Shield, CheckCircle, Upload, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

const benefits = [
  {
    icon: <Trophy className="w-6 h-6 text-workhoops-accent" />,
    title: 'CV deportivo profesional',
    description: 'Crea un perfil completo con tu historial, estadísticas y logros'
  },
  {
    icon: <Star className="w-6 h-6 text-workhoops-accent" />,
    title: 'Visibilidad ante clubes',
    description: 'Los reclutadores podrán encontrarte y contactar contigo directamente'
  },
  {
    icon: <Users className="w-6 h-6 text-workhoops-accent" />,
    title: 'Red profesional',
    description: 'Conecta con otros jugadores, entrenadores y profesionales del sector'
  },
  {
    icon: <Shield className="w-6 h-6 text-workhoops-accent" />,
    title: 'Perfil verificado',
    description: 'Proceso de verificación que aumenta tu credibilidad'
  }
]

const roles = [
  'Jugador/a',
  'Entrenador/a', 
  'Entrenador/a Asistente',
  'Preparador/a Físico',
  'Fisioterapeuta',
  'Árbitro/a',
  'Directivo/a',
  'Ojeador/a'
]

const positions = [
  'Base (Point Guard)',
  'Escolta (Shooting Guard)', 
  'Alero (Small Forward)',
  'Ala-Pívot (Power Forward)',
  'Pívot (Center)',
  'Polivalente'
]

export default function TalentoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>100% gratuito para jugadores y entrenadores</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black text-workhoops-primary leading-tight">
                  Construye tu{' '}
                  <span className="text-workhoops-accent">carrera deportiva</span>{' '}
                  profesional
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Crea tu perfil de talento y conecta con clubes, entrenadores y oportunidades 
                  que buscan exactamente tus habilidades y experiencia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register?role=jugador">
                  <Button size="lg" className="px-8 py-4 text-lg w-full sm:w-auto">
                    <Trophy className="w-5 h-5 mr-2" />
                    Crear perfil gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/oportunidades">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 w-full sm:w-auto">
                    <Users className="w-5 h-5 mr-2" />
                    Explorar talentos
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Perfil siempre gratuito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Verificación disponible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Red profesional</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1552155906-0c65e219fb6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxNHx8YmFza2V0YmFsbCUyMHBsYXllcnxlbnwwfHx8fDE3NTkwODg3Nzl8MA&ixlib=rb-4.1.0&q=85"
                  alt="Jugadores de baloncesto profesionales"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border">
                <div className="text-2xl font-bold text-workhoops-accent">2.500+</div>
                <div className="text-sm text-gray-600">Perfiles activos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué crear tu perfil de talento?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tu perfil es tu carta de presentación ante el mundo del baloncesto profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Registro */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Crea tu perfil de talento
            </h2>
            <p className="text-lg text-gray-600">
              Completa la información básica y empieza a recibir oportunidades
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>
                Esta información será visible en tu perfil público
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form className="space-y-6" action="/api/talent/create" method="POST">
                {/* Información Básica */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Nombre completo *</Label>
                    <Input 
                      id="fullName"
                      name="fullName"
                      placeholder="María García López"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birthDate">Fecha de nacimiento *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        className="pl-10 mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="role">Rol principal *</Label>
                    <Select name="role" required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona tu rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role.toLowerCase()}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        id="city"
                        name="city"
                        placeholder="Barcelona"
                        className="pl-10 mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información deportiva */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Información deportiva</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="position">Posición principal</Label>
                      <Select name="position">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position.toLowerCase()}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input 
                        id="height"
                        name="height"
                        type="number"
                        placeholder="185"
                        className="mt-1"
                        min="150"
                        max="250"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input 
                        id="weight"
                        name="weight"
                        type="number"
                        placeholder="80"
                        className="mt-1"
                        min="40"
                        max="150"
                      />
                    </div>
                  </div>
                </div>

                {/* Experiencia */}
                <div>
                  <Label htmlFor="bio">Biografía deportiva</Label>
                  <Textarea 
                    id="bio"
                    name="bio"
                    placeholder="Cuéntanos tu trayectoria, logros y objetivos profesionales..."
                    className="mt-1 min-h-[150px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 500 caracteres
                  </p>
                </div>

                {/* Enlaces */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="video">Vídeo destacado (opcional)</Label>
                    <Input 
                      id="video"
                      name="video"
                      type="url"
                      placeholder="https://youtube.com/..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="social">Redes sociales (opcional)</Label>
                    <Input 
                      id="social"
                      name="social"
                      type="url"
                      placeholder="https://instagram.com/..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    Crear perfil de talento
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>
                    Al crear tu perfil aceptas nuestros{' '}
                    <Link href="/legal/terminos" className="text-workhoops-accent hover:underline">
                      términos de uso
                    </Link>{' '}
                    y{' '}
                    <Link href="/legal/privacidad" className="text-workhoops-accent hover:underline">
                      política de privacidad
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Listo para dar el salto profesional?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Únete a miles de jugadores y entrenadores que ya confían en WorkHoops
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8 py-4">
              <Trophy className="w-5 h-5 mr-2" />
              Crear perfil gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}