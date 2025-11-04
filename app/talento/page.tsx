'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowRight, Star, Users, Trophy, Shield, CheckCircle, User, FileText, Briefcase, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const processSteps = [
  {
    number: 1,
    icon: <User className="w-8 h-8" />,
    title: 'Regístrate',
    description: 'Crea tu cuenta y elige tu rol: Jugador o Entrenador'
  },
  {
    number: 2,
    icon: <FileText className="w-8 h-8" />,
    title: 'Completa tu perfil',
    description: 'Formulario multi-paso personalizado según tu rol con toda tu información profesional'
  },
  {
    number: 3,
    icon: <Briefcase className="w-8 h-8" />,
    title: 'Conecta con oportunidades',
    description: 'Los clubes y agencias te encontrarán y podrán contactarte directamente'
  }
]

const testimonials = [
  {
    name: 'Carlos Martínez',
    role: 'Base - ACB',
    image: '👤',
    quote: 'Gracias a WorkHoops conseguí mi primer contrato profesional en ACB. El proceso fue muy sencillo y los clubes pudieron ver todo mi potencial.',
    achievement: 'Fichó por CB Estudiantes'
  },
  {
    name: 'Laura Sánchez',
    role: 'Entrenadora - EBA',
    image: '👤',
    quote: 'Como entrenadora, tener un perfil completo me ayudó a destacar. Ahora dirijo un equipo de EBA y todo empezó aquí.',
    achievement: 'Primer entrenador en CB Morón'
  },
  {
    name: 'Miguel Ángel Torres',
    role: 'Alero - LEB Oro',
    image: '👤',
    quote: 'La visibilidad que da WorkHoops es increíble. Recibí varias ofertas de clubes que nunca hubieran sabido de mí sin esta plataforma.',
    achievement: 'Fichó por Tizona Burgos'
  }
]

const faqs = [
  {
    question: '¿Qué incluye mi perfil?',
    answer: 'Tu perfil incluye datos personales, información técnica (altura, peso, posición), habilidades evaluadas, historial deportivo, videos destacados, logros y mucho más. Todo adaptado a tu rol específico.'
  },
  {
    question: '¿Quién puede ver mi perfil?',
    answer: 'Tu perfil es visible para clubes, agencias y reclutadores registrados en la plataforma. Tú controlas la visibilidad y puedes hacer tu perfil público o privado en cualquier momento.'
  },
  {
    question: '¿Es gratuito crear un perfil?',
    answer: 'Sí, crear y mantener tu perfil es completamente gratuito. Ofrecemos planes premium con características adicionales como mayor visibilidad y estadísticas avanzadas.'
  },
  {
    question: '¿Cuánto tiempo tarda en completarse el perfil?',
    answer: 'El formulario multi-paso está diseñado para completarse en 10-15 minutos. Puedes guardar tu progreso y continuar más tarde si lo necesitas.'
  }
]

export default function TalentoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user has a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (status === 'loading') return
      
      if (session?.user) {
        try {
          const response = await fetch('/api/talent/profile')
          if (response.ok) {
            const data = await response.json()
            setHasProfile(!!data.profile)
          }
        } catch (err) {
          console.error('Error checking profile:', err)
        }
      }
      setIsLoading(false)
    }

    checkProfile()
  }, [session, status])

  // Determine CTA based on user state
  const getCTAButton = () => {
    if (status === 'loading' || isLoading) {
      return null
    }

    if (!session) {
      return (
        <Link href="/auth/register">
          <Button size="lg" className="px-8 py-4 text-lg w-full sm:w-auto">
            <Trophy className="w-5 h-5 mr-2" />
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      )
    }

    if (!hasProfile) {
      return (
        <Link href="/profile/complete">
          <Button size="lg" className="px-8 py-4 text-lg w-full sm:w-auto">
            <FileText className="w-5 h-5 mr-2" />
            Completar mi perfil
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      )
    }

    return (
      <Link href="/talento/perfiles">
        <Button size="lg" className="px-8 py-4 text-lg w-full sm:w-auto">
          <Users className="w-5 h-5 mr-2" />
          Ver perfiles públicos
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    )
  }

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
                  Impulsa tu{' '}
                  <span className="text-workhoops-accent">carrera en el baloncesto</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Crea tu perfil profesional y conecta con clubes, entrenadores y oportunidades 
                  que buscan exactamente tus habilidades y experiencia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {getCTAButton()}
                
                <Link href="/talento/perfiles">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 w-full sm:w-auto">
                    Explorar perfiles
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
                  src="https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxiYXNrZXRiYWxsJTIwcGxheWVyfGVufDB8fHx8MTc2MTIyOTI2Mnww&ixlib=rb-4.1.0&q=85"
                  alt="Jugador de baloncesto"
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

      {/* Proceso de 3 pasos */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cómo funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En solo 3 pasos, tu perfil estará listo para conectar con oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-workhoops-accent text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <div className="text-workhoops-accent">
                        {step.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-workhoops-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {getCTAButton()}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Casos de éxito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre cómo otros profesionales han impulsado su carrera con WorkHoops
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-3">{testimonial.image}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <Quote className="w-8 h-8 text-workhoops-accent mb-3 opacity-50" />
                  
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {testimonial.achievement}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-gray-600">
              Todo lo que necesitas saber sobre tu perfil de talento
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-workhoops-primary to-workhoops-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para dar el siguiente paso en tu carrera?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Únete a miles de jugadores y entrenadores que ya están conectando con oportunidades
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {getCTAButton()}
          </div>
        </div>
      </section>
    </div>
  )
}
