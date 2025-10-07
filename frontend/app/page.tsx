import Link from 'next/link'
import { ArrowRight, Search, Target, Users, Shield, CheckCircle, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { getOpportunityTypeLabel, getOpportunityTypeColor, formatRelativeTime } from '@/lib/utils'

async function getHomeData() {
  try {
    const [featuredOpportunities, totalOpportunities, totalOrganizations] = await Promise.all([
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
      prisma.opportunity.count({
        where: { status: 'publicada' },
      }),
      prisma.organization.count({
        where: { verified: true },
      }),
    ])

    return {
      featuredOpportunities,
      stats: {
        opportunities: totalOpportunities,
        organizations: totalOrganizations,
        users: 150, // Placeholder - you could count actual users if needed
      },
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredOpportunities: [],
      stats: {
        opportunities: 0,
        organizations: 0,
        users: 0,
      },
    }
  }
}

export default async function HomePage() {
  const { featuredOpportunities, stats } = await getHomeData()

  return (
    <div className="min-h-screen">
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
                  <Shield className="w-4 h-4" />
                  <span>Verificamos todas las ofertas manualmente</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                  Tu próximo salto en el{' '}
                  <span className="text-workhoops-accent">baloncesto</span>{' '}
                  empieza aquí
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Encuentra pruebas, torneos, becas, equipos y trabajos. 
                  Conecta con quien busca tu talento en el baloncesto español.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/oportunidades">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <Search className="w-5 h-5 mr-2" />
                    Explorar oportunidades
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/publicar">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                    Publicar una oferta
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>RGPD compliant</span>
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85"
                  alt="Jugadores de baloncesto en acción"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border">
                <div className="text-2xl font-bold text-workhoops-accent">{stats.opportunities}+</div>
                <div className="text-sm text-gray-600">Oportunidades activas</div>
              </div>
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
              En tres sencillos pasos conectamos el talento con las oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Descubre</h3>
              <p className="text-gray-600">
                Explora cientos de oportunidades verificadas: empleos, pruebas, torneos, becas y patrocinios.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Aplica</h3>
              <p className="text-gray-600">
                Aplica directamente desde la plataforma con tu perfil profesional y portfolio.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-workhoops-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Conecta</h3>
              <p className="text-gray-600">
                Encuentra tu lugar en el baloncesto español y da el salto profesional que mereces.
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
              <Button variant="outline" className="hidden sm:flex">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getOpportunityTypeColor(opportunity.type)}>
                      {getOpportunityTypeLabel(opportunity.type)}
                    </Badge>
                    {opportunity.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {opportunity.title}
                  </CardTitle>
                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                    {opportunity.organization?.logo && (
                      <img 
                        src={opportunity.organization.logo}
                        alt={opportunity.organization.name}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span>{opportunity.organization?.name || 'Organizador individual'}</span>
                    {opportunity.organization.verified && (
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-500">
                      📍 {opportunity.city}
                    </div>
                    {opportunity.deadline && (
                      <div className="text-sm text-orange-600">
                        ⏰ {formatRelativeTime(opportunity.deadline)}
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/oportunidades/${opportunity.slug}`}>
                    <Button variant="outline" className="w-full">
                      Ver detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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

      {/* CTA Section */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Listo para encontrar tu oportunidad?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de jugadores y organizaciones que ya confían en WorkHoops
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/planes">
              <Button size="lg" variant="secondary" className="px-8 py-4">
                Ver planes y precios
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-workhoops-accent px-8 py-4">
                Explorar oportunidades
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}