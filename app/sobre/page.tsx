import Link from 'next/link'
import { Target, Users, Shield, Award, Heart, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

const values = [
  {
    icon: <Target className="w-6 h-6 text-workhoops-accent" />,
    title: 'Transparencia',
    description: 'Verificamos manualmente cada oferta y somos claros sobre cómo funciona nuestra plataforma'
  },
  {
    icon: <Users className="w-6 h-6 text-workhoops-accent" />,
    title: 'Comunidad',
    description: 'Construimos una red sólida donde jugadores, entrenadores y clubes crecen juntos'
  },
  {
    icon: <Shield className="w-6 h-6 text-workhoops-accent" />,
    title: 'Confianza',
    description: 'Priorizamos la seguridad y veracidad de todas las oportunidades publicadas'
  },
  {
    icon: <Award className="w-6 h-6 text-workhoops-accent" />,
    title: 'Excelencia',
    description: 'Buscamos conectar talento excepcional con organizaciones que valoran la calidad'
  }
]

const stats = [
  { number: '2,500+', label: 'Jugadores registrados' },
  { number: '150+', label: 'Clubes verificados' }, 
  { number: '500+', label: 'Oportunidades publicadas' },
  { number: '95%', label: 'Satisfacción de usuarios' }
]

const team = [
  {
    name: 'Eduardo Jiménez',
    role: 'CEO & Fundador',
    bio: 'Amante del baloncesto y la tecnología, con más de 12 años en las canchas y la misión de conectar el talento con nuevas oportunidades',
    icon: 'user'
  },
  {
    name: 'Equipo de Operaciones',
    role: 'Head of Operations',
    bio: 'Especialistas en desarrollo deportivo y gestión de talento',
    icon: 'users'
  },
  {
    name: 'Equipo Técnico',
    role: 'Technology Team',
    bio: 'Ingenieros con experiencia en plataformas de alto rendimiento',
    icon: 'zap'
  }
]

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Base - CB Alcázar',
    text: 'Gracias a WorkHoops conseguí mi primera oportunidad en LEB Plata. La plataforma es clara y directa, sin intermediarios innecesarios.',
    rating: 5
  },
  {
    name: 'Laura P.',
    role: 'Alero - Basket Ferrol',
    text: 'Me encanta poder ver todas las ofertas en un solo lugar. Antes perdía horas buscando en diferentes sitios. Ahora aplico en minutos.',
    rating: 5
  },
  {
    name: 'Javier S.',
    role: 'Entrenador - Baloncesto Ciudad Real',
    text: 'Encontré un puesto de entrenador asistente perfecto para mi. El proceso fue transparente y rápido.',
    rating: 5
  },
  {
    name: 'Club Basket Valladolid',
    role: 'Director Deportivo',
    text: 'Hemos fichado a 3 jugadores excelentes a través de WorkHoops. La calidad de los perfiles es muy buena.',
    rating: 5
  },
  {
    name: 'Miguel A.',
    role: 'Pívot - Melilla Baloncesto',
    text: 'Después de 2 años sin equipo, WorkHoops me ayudó a volver a las pistas. Eternamente agradecido.',
    rating: 5
  },
  {
    name: 'Ana R.',
    role: 'Escolta - CB Conquero',
    text: 'Lo mejor es que puedo crear mi perfil completo con video y estadísticas. Los clubs se toman en serio las candidaturas.',
    rating: 5
  }
]

export default function SobrePage() {
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
                  <Heart className="w-4 h-4" />
                  <span>Impulsados por la pasión al baloncesto</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black text-workhoops-primary leading-tight">
                  Conectamos{' '}
                  <span className="text-workhoops-accent">talento y oportunidades</span>{' '}
                  en el baloncesto español
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Nacimos para democratizar el acceso a oportunidades profesionales 
                  en el mundo del baloncesto, creando un ecosistema transparente 
                  donde el talento encuentra su lugar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/talento">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <Target className="w-5 h-5 mr-2" />
                    Únete a la comunidad
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/contacto">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                    Habla con nosotros
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
                  alt="Equipo de baloncesto profesional"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black text-workhoops-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Nuestra misión
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  En WorkHoops creemos que <strong>cada jugador y entrenador merece 
                  una oportunidad real</strong> de desarrollar su carrera profesional, 
                  independientemente de sus contactos o su red actual.
                </p>
                <p>
                  Trabajamos para <strong>eliminar las barreras tradicionales</strong> 
                  que dificultan el acceso a oportunidades en el baloncesto español, 
                  desde pruebas y empleos hasta becas y patrocinios.
                </p>
                <p>
                  Nuestro compromiso es construir un <strong>ecosistema transparente 
                  y meritocrático</strong> donde el talento sea lo único que importe.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Cómo lo hacemos
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Verificación manual</h4>
                    <p className="text-sm text-gray-600">Cada oferta es revisada por nuestro equipo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Acceso gratuito</h4>
                    <p className="text-sm text-gray-600">Los jugadores siempre acceden gratis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Soporte humano</h4>
                    <p className="text-sm text-gray-600">Acompañamos en cada paso del proceso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestros valores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión y cada interacción en WorkHoops
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Make Money */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cómo nos financiamos
            </h2>
            <p className="text-lg text-gray-600">
              Transparencia total sobre nuestro modelo de negocio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-workhoops-accent" />
                  <span>Planes Pro</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Los jugadores pueden optar por planes premium para aumentar 
                  su visibilidad y acceder a más funcionalidades.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-workhoops-accent" />
                  <span>Ofertas destacadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Los clubes pueden destacar sus ofertas para llegar a más 
                  candidatos cualificados de forma más rápida.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-workhoops-accent" />
                  <span>Servicios enterprise</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Soluciones personalizadas para federaciones, ligas y 
                  organizaciones que gestionan múltiples equipos.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              <strong>¿Lo más importante?</strong> Los jugadores y entrenadores siempre 
              tendrán acceso gratuito a las oportunidades básicas.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestro equipo
            </h2>
            <p className="text-lg text-gray-600">
              Profesionales apasionados por el baloncesto y la tecnología
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    {member.icon === 'user' && <Users className="w-12 h-12 text-workhoops-accent" />}
                    {member.icon === 'users' && <Users className="w-12 h-12 text-workhoops-accent" />}
                    {member.icon === 'zap' && <Zap className="w-12 h-12 text-workhoops-accent" />}
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-workhoops-accent font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen de nosotros
            </h2>
            <p className="text-lg text-gray-600">
              Testimonios reales de nuestra comunidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Listo para formar parte de WorkHoops?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Únete a nuestra comunidad y da el siguiente paso en tu carrera deportiva
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/talento">
              <Button size="lg" variant="secondary" className="px-8 py-4">
                <Target className="w-5 h-5 mr-2" />
                Crear perfil gratis
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-workhoops-accent px-8 py-4">
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}