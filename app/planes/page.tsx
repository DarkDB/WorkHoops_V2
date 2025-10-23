'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Check, Star, Trophy, Users, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { toast } from 'sonner'

const plans = [
  {
    id: 'free_amateur',
    name: 'Free',
    subtitle: 'Amateur',
    price: 0,
    period: '',
    description: 'Perfecto para empezar en WorkHoops',
    popular: false,
    features: [
      'Perfil público en la comunidad',
      'Acceso a ofertas básicas y abiertas',
      'Acceso a eventos gratuitos',
      'Búsqueda básica de oportunidades',
      'Notificaciones por email'
    ],
    cta: 'Comenzar gratis',
    targetAudience: 'Jugadores y entrenadores que empiezan',
    icon: <Users className="w-6 h-6" />,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  {
    id: 'pro_semipro',
    name: 'Pro',
    subtitle: 'Semi-Pro',
    price: 4.99,
    period: '/mes',
    annualPrice: 39.92,
    description: 'Para jugadores y entrenadores serios',
    popular: true,
    features: [
      'Todas las funciones del plan Free',
      'Acceso a TODAS las ofertas (básicas + exclusivas)',
      'Perfil destacado en búsquedas',
      'Aplicaciones ilimitadas',
      'Filtros avanzados (posición, país, categoría)',
      'Soporte prioritario',
      'Estadísticas básicas de perfil',
      'Notificaciones en tiempo real'
    ],
    cta: 'Contratar plan',
    targetAudience: 'Jugadores y entrenadores que buscan visibilidad real',
    icon: <Zap className="w-6 h-6" />,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: 'club_agencia',
    name: 'Club',
    subtitle: 'Agencia',
    price: 0,
    period: '',
    description: 'Para equipos, clubes y agencias',
    popular: false,
    features: [
      'Publicación de 1 oferta gratuita',
      'Acceso a panel de gestión de candidatos',
      'Contacto directo con postulantes',
      'Estadísticas básicas de vacantes',
      'Perfil de organización verificado'
    ],
    cta: 'Crear perfil de club',
    targetAudience: 'Equipos, clubes o agencias que buscan talento',
    icon: <Trophy className="w-6 h-6" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'destacado',
    name: 'Destacado',
    subtitle: 'Premium',
    price: 49,
    period: '/60 días',
    description: 'Máxima visibilidad para tus ofertas',
    popular: false,
    features: [
      'Todas las funciones del plan Club',
      'Publicación destacada durante 60 días',
      'Promoción en redes sociales WorkHoops',
      'Soporte prioritario dedicado',
      'Hasta 3 publicaciones simultáneas',
      'Estadísticas avanzadas de candidatos',
      'Posición premium en listados'
    ],
    cta: 'Destacar oferta',
    targetAudience: 'Clubes y agencias que quieren promocionar sus ofertas',
    icon: <Star className="w-6 h-6" />,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  }
]

export default function PlanesPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const { data: session, status } = useSession()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handlePlanSelection = async (planId: string) => {
    // If user is not logged in, redirect to register with plan pre-selected
    if (status === 'unauthenticated') {
      window.location.href = `/auth/register?plan=${planId}`
      return
    }

    // For free plans, just redirect to register or dashboard
    if (planId === 'free_amateur' || planId === 'club_agencia') {
      window.location.href = status === 'authenticated' ? '/dashboard' : `/auth/register?plan=${planId}`
      return
    }

    // For paid plans, create checkout session
    if (planId === 'pro_semipro' || planId === 'destacado') {
      setLoadingPlan(planId)
      
      try {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planType: planId,
            billingCycle: planId === 'pro_semipro' ? billingCycle : undefined,
            returnUrl: window.location.origin
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error al crear sesión de pago')
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No se recibió URL de checkout')
        }
      } catch (error) {
        toast.error('Error', {
          description: error instanceof Error ? error.message : 'Error al procesar el pago'
        })
        setLoadingPlan(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-blue-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                Elige tu plan en{' '}
                <span className="text-workhoops-accent">WorkHoops</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Precios accesibles para maximizar el volumen y conectar a toda la comunidad del baloncesto español
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-workhoops-accent text-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-workhoops-accent text-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Anual (2 meses gratis)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.bgColor} ${plan.borderColor} border-2 hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-workhoops-accent transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-workhoops-accent text-white px-4 py-1">
                      Más popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-workhoops-accent text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-medium">
                    {plan.subtitle}
                  </p>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-black text-workhoops-primary">
                        {plan.price === 0 ? 'Gratis' : `${
                          billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price
                        }€`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-1">
                          {billingCycle === 'annual' && plan.annualPrice ? '/año' : plan.period}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'annual' && plan.annualPrice && (
                      <p className="text-sm text-green-600 mt-1">
                        Ahorras {((plan.price * 12) - plan.annualPrice).toFixed(0)}€ al año
                      </p>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={loadingPlan === plan.id}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-workhoops-accent hover:bg-orange-600 text-white' 
                          : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2">
                    {plan.targetAudience}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model Explanation */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            ¿Por qué precios tan accesibles?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Volumen</h3>
              <p className="text-gray-600">
                Precios bajos para atraer a toda la comunidad del baloncesto español y crear una masa crítica
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Accesibilidad</h3>
              <p className="text-gray-600">
                Que ningún jugador o entrenador se quede sin oportunidades por motivos económicos
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-workhoops-accent" />
              </div>
              <h3 className="text-lg font-semibold">Impacto</h3>
              <p className="text-gray-600">
                Monetización a través del volumen de suscripciones Pro y planes destacados de clubs
              </p>
            </div>
          </div>

          <div className="mt-12 bg-orange-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-workhoops-primary mb-4">
              🎯 Objetivo: Conectar a toda la comunidad del baloncesto
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Con precios accesibles creamos un ecosistema donde jugadores, entrenadores y clubes 
              se encuentren fácilmente. El éxito se mide en conexiones exitosas, no en precios altos.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas frecuentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-gray-600">
                Sí, puedes actualizar o cancelar tu plan en cualquier momento desde tu panel de usuario.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">¿Qué incluye la verificación de ofertas?</h3>
              <p className="text-gray-600">
                Nuestro equipo verifica manualmente cada oferta para asegurar que son reales, legales y de organizaciones legítimas.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">¿Hay descuentos para estudiantes?</h3>
              <p className="text-gray-600">
                Actualmente no, pero nuestros precios ya están diseñados para ser accesibles para toda la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Únete a WorkHoops y encuentra tu próxima oportunidad en el baloncesto
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8 py-4">
              Crear cuenta gratuita
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}