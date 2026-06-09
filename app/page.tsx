import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search, Target, Users, Shield, CheckCircle, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { OpportunityCard } from '@/components/shared/OpportunityCard'
import { prisma } from '@/lib/prisma'
import { getSiteStats } from '@/lib/site-stats'
import { getOpportunityTypeLabel, getOpportunityTypeColor, formatRelativeTime } from '@/lib/utils'
export const revalidate = 300

async function getHomeData() {
  try {
    const [featuredOpportunities, stats] = await Promise.all([
      prisma.opportunity.findMany({
        where: {
          status: 'publicada',
          publishedAt: { not: null },
        },
        take: 6,
        orderBy: [
          { publishedAt: 'desc' }
        ],
        include: {
          organization: {
            select: {
              name: true,
              logo: true,
              verified: true,
            },
          },
        },
      }),
      getSiteStats(),
    ])

    return {
      featuredOpportunities,
      stats,
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredOpportunities: [],
      stats: {
        opportunities: 50,
        organizations: 25,
        users: 200,
        profiles: 150,
      },
    }
  }
}

export default async function HomePage() {
  const { featuredOpportunities, stats } = await getHomeData()

  // Summer banner: visible only in July (6) and August (7) — getMonth() is 0-indexed
  const currentMonth = new Date().getMonth()
  const showSummerBanner = currentMonth === 6 || currentMonth === 7

  const visibleOpportunities = featuredOpportunities.slice(0, 2)
  const lockedOpportunities = featuredOpportunities.slice(2, 6)

  return (
    <div className="min-h-screen">
      {/* Summer urgency banner */}
      {showSummerBanner && (
        <div
          className="w-full py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-white text-sm font-medium"
          style={{ backgroundColor: '#c2410c' }}
        >
          <span>🔥 Mercado de verano activo — Registrate gratis y que los clubes te encuentren</span>
          <Link href="/auth/register">
            <Button
              size="sm"
              className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-4"
            >
              Unirme ahora →
            </Button>
          </Link>
        </div>
      )}

      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  <span>Gratis para jugadores · España y LATAM</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                  Tu próximo contrato de{' '}
                  <span className="text-workhoops-accent">baloncesto</span>{' '}
                  empieza aquí.
                </h1>

                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Crea tu perfil gratis y deja que los clubes de España y LATAM te encuentren. Sin intermediarios, sin agentes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <Search className="w-5 h-5 mr-2" />
                    Crear mi perfil gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link href="/publicar">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                    ¿Eres un club? Publica gratis →
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Gratis para jugadores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Ofertas verificadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Gratuito para jugadores</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl image-zoom">
                <Image
                  src="/images/hero-basketball.svg"
                  alt="Jugadores de baloncesto en acción"
                  width={1200}
                  height={900}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-workhoops-accent to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              La comunidad crece cada día
            </h2>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto">
              Jugadores, clubes y oportunidades publicadas en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 fade-in-stagger">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center card-hover">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {stats.opportunities.toLocaleString('es-ES')}+
              </div>
              <div className="text-orange-100 font-medium">Oportunidades publicadas</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center card-hover">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {stats.users.toLocaleString('es-ES')}+
              </div>
              <div className="text-orange-100 font-medium">Usuarios registrados</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center card-hover">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {stats.organizations.toLocaleString('es-ES')}+
              </div>
              <div className="text-orange-100 font-medium">Clubes verificados</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center card-hover">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {stats.profiles.toLocaleString('es-ES')}+
              </div>
              <div className="text-orange-100 font-medium">Perfiles de talento</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cómo funciona WorkHoops
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En tres pasos ayudamos a clubes y talento a encontrarse
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Descubre</h3>
              <p className="text-gray-600">
                Explora oportunidades publicadas por clubes y perfiles disponibles para scouting.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Aplica</h3>
              <p className="text-gray-600">
                Los jugadores pueden aplicar o dejar que los clubes contacten desde su perfil.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Conecta</h3>
              <p className="text-gray-600">
                Gestiona el contacto entre club y talento sin salir de WorkHoops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Oportunidades destacadas
              </h2>
              <p className="text-lg text-gray-600">
                Las últimas ofertas verificadas por nuestro equipo
              </p>
            </div>
            <Link href="/oportunidades">
              <Button variant="outline" className="hidden sm:flex button-press">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-stagger">
              {/* First 2 cards — always visible */}
              {visibleOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}

              {/* Cards 3–6 — blurred */}
              {lockedOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  style={{
                    filter: 'blur(4px)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  <OpportunityCard opportunity={opportunity} />
                </div>
              ))}
            </div>

            {/* Content gate overlay — covers the blurred cards */}
            {lockedOpportunities.length > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-4 rounded-xl px-6 py-10"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  zIndex: 10,
                  // Height proportional to locked cards rows
                  height: lockedOpportunities.length > 3 ? '55%' : '50%',
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-workhoops-accent" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 text-center">
                    {lockedOpportunities.length} ofertas más esperando
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    Gratis para jugadores · Sin tarjeta de crédito
                  </p>
                  <Link href="/auth/register">
                    <Button className="bg-workhoops-accent hover:bg-orange-700 text-white px-8 py-3 text-base font-semibold">
                      Ver todas las ofertas →
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-400">Ya hay +200 jugadores registrados</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/oportunidades">
              <Button>
                Ver todas las oportunidades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Historias de éxito
            </h2>
            <p className="text-lg text-gray-600">
              Lo que dicen quienes ya usan WorkHoops
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 fade-in-stagger">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Gracias a WorkHoops conseguí mi primera oportunidad en LEB Plata. La plataforma es clara y directa, sin intermediarios innecesarios."</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">Carlos M.</p>
                  <p className="text-sm text-gray-500">Base - CB Alcázar</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Hemos fichado a 3 jugadores excelentes a través de WorkHoops. La calidad de los perfiles es muy buena."</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">Club Basket Valladolid</p>
                  <p className="text-sm text-gray-500">Director Deportivo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Después de 2 años sin equipo, WorkHoops me ayudó a volver a las pistas. Eternamente agradecido."</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">Miguel A.</p>
                  <p className="text-sm text-gray-500">Pívot - Melilla Baloncesto</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            El mercado de verano no espera. ¿Tu perfil está listo?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Únete gratis y aparece en las búsquedas de clubes de toda España y LATAM
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-workhoops-accent hover:bg-gray-100 px-8 py-4 button-press">
                Crear mi perfil gratis
              </Button>
            </Link>
            <Link href="/auth/register?rol=club">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-workhoops-accent px-8 py-4 button-press">
                Soy un club, quiero fichar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
