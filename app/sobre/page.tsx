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
    name: 'Carlos Martínez',
    role: 'CEO & Fundador',
    bio: 'Ex-jugador profesional con 15 años de experiencia en LEB y ACB',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=150'
  },
  {
    name: 'Ana García',
    role: 'Head of Operations',
    bio: 'Especialista en desarrollo deportivo y gestión de talento',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b6cd?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=150'
  },
  {
    name: 'Miguel Torres',
    role: 'CTO',
    bio: 'Ingeniero con experiencia en plataformas de alto rendimiento',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=150'
  }
]

const partners = [
  { name: 'Federación Española de Baloncesto', logo: '/logos/feb.png' },
  { name: 'Liga Endesa', logo: '/logos/endesa.png' },
  { name: 'EuroLeague', logo: '/logos/euroleague.png' },
  { name: 'Basketball Champions League', logo: '/logos/bcl.png' }
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
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
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

      {/* Partners */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Colaboramos con
            </h2>
            <p className="text-lg text-gray-600">
              Partners que comparten nuestra visión del baloncesto
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                </div>
              </div>
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