import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, CheckCircle, Search } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Clubes de baloncesto | WorkHoops',
  description: 'Explora clubes y academias de baloncesto, descubre sus ofertas activas y conecta con sus proyectos de reclutamiento.'
}

interface ClubesPageProps {
  searchParams?: {
    city?: string
  }
}

export default async function ClubesPage({ searchParams }: ClubesPageProps) {
  const session = await getServerSession(authOptions)
  const city = searchParams?.city?.trim()

  const clubs = await prisma.user.findMany({
    where: {
      role: {
        in: ['club', 'agencia']
      },
      clubAgencyProfile: {
        is: {
          isPublic: true,
          slug: {
            not: null
          },
          ...(city
            ? {
                city: {
                  contains: city,
                  mode: 'insensitive'
                }
              }
            : {})
        }
      }
    },
    include: {
      clubAgencyProfile: true,
      opportunities: {
        where: {
          status: 'publicada'
        },
        select: {
          id: true
        }
      }
    },
    orderBy: [
      {
        planType: 'desc'
      },
      {
        updatedAt: 'desc'
      }
    ]
  })

  const items = clubs
    .filter((club) => !!club.clubAgencyProfile?.slug)
    .map((club) => ({
      id: club.id,
      slug: club.clubAgencyProfile!.slug!,
      name: club.clubAgencyProfile!.commercialName || club.clubAgencyProfile!.legalName,
      city: club.clubAgencyProfile!.city,
      logo: club.clubAgencyProfile!.logo,
      verified: club.verified,
      opportunitiesCount: club.opportunities.length
    }))

  const isLoggedIn = !!session
  const VISIBLE_COUNT = 2
  const displayedTotal = Math.max(items.length, 25)
  const hiddenCount = Math.max(displayedTotal - VISIBLE_COUNT, 8)
  const visibleItems = isLoggedIn ? items : items.slice(0, VISIBLE_COUNT)
  const blurredItems = isLoggedIn ? [] : items.slice(VISIBLE_COUNT)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="relative py-12 lg:py-16 bg-gradient-to-br from-workhoops-primary to-workhoops-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            <span>Directorio público de clubes</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">Clubes en WorkHoops</h1>
          <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
            Descubre clubes, revisa sus ofertas activas y aplica directamente desde sus páginas públicas.
          </p>
        </div>
      </section>

      <section className="py-3 bg-orange-50 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-orange-800 font-medium text-sm">🏟️ Descubre los clubs que están fichando este verano</p>
        </div>
      </section>

      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form method="GET" className="max-w-lg">
            <label htmlFor="city" className="sr-only">Buscar por ciudad</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="city" name="city" placeholder="Filtrar por ciudad" defaultValue={city || ''} className="pl-9" />
            </div>
          </form>
          <p className="text-sm text-gray-600 mt-3">Mostrando {displayedTotal} clubes</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600">No hay clubes que coincidan con el filtro actual.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleItems.map((club) => (
                  <Link key={club.id} href={`/club/${club.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {club.logo ? (
                              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          {club.verified && (
                            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verificado
                            </span>
                          )}
                        </div>

                        <CardTitle className="text-xl">{club.name}</CardTitle>

                        <div className="space-y-1 text-sm text-gray-600 mt-2">
                          <div className="inline-flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {club.city}
                          </div>
                          <div className="inline-flex items-center text-workhoops-accent font-medium">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {club.opportunitiesCount} {club.opportunitiesCount === 1 ? 'oferta activa' : 'ofertas activas'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">Ver página del club</Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {blurredItems.map((club) => (
                  <div key={club.id} className="relative">
                    <Card className="h-full blur-sm pointer-events-none opacity-60">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {club.logo ? (
                              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-xl">{club.name}</CardTitle>
                        <div className="space-y-1 text-sm text-gray-600 mt-2">
                          <div className="inline-flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {club.city}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">Ver página del club</Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {!isLoggedIn && (
                <div className="mt-6 relative">
                  <div className="rounded-xl border border-orange-200 bg-white/80 backdrop-blur-sm p-8 text-center shadow-sm">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-orange-400" />
                    <p className="text-lg font-semibold text-gray-800 mb-1">
                      Hay {hiddenCount} clubs más en WorkHoops
                    </p>
                    <p className="text-sm text-gray-500 mb-4">Regístrate gratis para verlos todos</p>
                    <Link href="/auth/register">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
                        Ver todos los clubs →
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-400 mt-3">Gratis · Sin tarjeta de crédito</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
