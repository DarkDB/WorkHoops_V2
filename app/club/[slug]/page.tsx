import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ClubInterestForm from '@/components/clubs/ClubInterestForm'
import {
  Building2,
  MapPin,
  Briefcase,
  Users,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ArrowLeft
} from 'lucide-react'

interface PageProps {
  params: {
    slug: string
  }
}

function getAvailabilityLabel(status?: string | null) {
  if (status === 'AVAILABLE') return { label: 'Disponible', className: 'bg-green-100 text-green-800' }
  if (status === 'OPEN_TO_OFFERS') return { label: 'Abierto a ofertas', className: 'bg-blue-100 text-blue-800' }
  return { label: 'No disponible', className: 'bg-gray-100 text-gray-700' }
}

async function getClubBySlug(slug: string) {
  const club = await prisma.clubAgencyProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          verified: true,
          planType: true
        }
      }
    }
  })

  return club
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const club = await getClubBySlug(params.slug)

  if (!club) {
    return {
      title: 'Club no encontrado | WorkHoops',
      description: 'El club que buscas no está disponible en WorkHoops.'
    }
  }

  const clubName = club.commercialName || club.legalName

  return {
    title: `${clubName} | Club en WorkHoops`,
    description: club.description || `Conoce ${clubName}, revisa sus ofertas activas y envía tu interés para jugar en su proyecto.`,
    openGraph: {
      title: `${clubName} | WorkHoops`,
      description: club.description || `Página pública del club ${clubName} en WorkHoops.`,
      images: club.logo ? [club.logo] : undefined
    }
  }
}

export default async function ClubPublicPage({ params }: PageProps) {
  const [session, club] = await Promise.all([
    getServerSession(authOptions),
    getClubBySlug(params.slug)
  ])

  if (!club || !club.isPublic || (club.user.role !== 'club' && club.user.role !== 'agencia')) {
    notFound()
  }

  const clubName = club.commercialName || club.legalName
  const viewerIsClubOwner = session?.user?.id === club.userId
  const viewerIsClubOrAgency = session?.user?.role === 'club' || session?.user?.role === 'agencia'
  const canPrefillLeadForm = !!session?.user?.id && !viewerIsClubOwner && !viewerIsClubOrAgency

  const [opportunities, associatedPlayers, currentUser] = await Promise.all([
    prisma.opportunity.findMany({
      where: {
        authorId: club.userId,
        status: 'publicada'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        city: true,
        level: true,
        type: true,
        createdAt: true
      }
    }),
    prisma.talentProfile.findMany({
      where: {
        isPublic: true,
        OR: [
          { lastTeam: { contains: club.legalName, mode: 'insensitive' } },
          ...(club.commercialName ? [{ lastTeam: { contains: club.commercialName, mode: 'insensitive' as const } }] : [])
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 6,
      select: {
        id: true,
        fullName: true,
        city: true,
        position: true,
        currentLevel: true,
        availabilityStatus: true,
        user: {
          select: {
            image: true
          }
        }
      }
    }),
    canPrefillLeadForm
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            talentProfile: {
              select: {
                fullName: true,
                birthDate: true,
                position: true,
                height: true,
                city: true
              }
            }
          }
        })
      : Promise.resolve(null)
  ])

  let prefillAge: number | null = null
  if (canPrefillLeadForm && currentUser?.talentProfile?.birthDate) {
    const birthDate = new Date(currentUser.talentProfile.birthDate)
    const today = new Date()
    prefillAge = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      prefillAge -= 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/clubes" className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a clubes
        </Link>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {club.logo ? (
                  <img src={club.logo} alt={clubName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{clubName}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <span className="inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {club.city}
                  </span>
                  <span className="inline-flex items-center text-workhoops-accent font-medium">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {opportunities.length} {opportunities.length === 1 ? 'oferta activa' : 'ofertas activas'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/talento/perfiles">
                    <Button className="bg-workhoops-accent hover:bg-orange-600">
                      <Users className="w-4 h-4 mr-2" />
                      Buscar jugadores
                    </Button>
                  </Link>
                  <a href="#quiero-jugar">
                    <Button variant="outline">Quiero jugar en este club</Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {club.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre el club</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{club.description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Ofertas activas</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunities.length === 0 ? (
                  <p className="text-gray-600 text-sm">Este club no tiene ofertas activas en este momento.</p>
                ) : (
                  <div className="space-y-3">
                    {opportunities.map((opportunity) => (
                      <Link key={opportunity.id} href={`/oportunidades/${opportunity.slug}`} className="block border rounded-lg p-4 hover:border-workhoops-accent hover:shadow-sm transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                          <Badge variant="outline">{opportunity.type}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {opportunity.city || club.city}
                          <span>• {opportunity.level}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jugadores asociados</CardTitle>
              </CardHeader>
              <CardContent>
                {associatedPlayers.length === 0 ? (
                  <p className="text-gray-600 text-sm">Todavía no hay jugadores asociados públicamente a este club.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {associatedPlayers.map((player) => {
                      const availability = getAvailabilityLabel(player.availabilityStatus)
                      return (
                        <Link key={player.id} href={`/talento/perfiles/${player.id}`} className="border rounded-lg p-4 hover:border-workhoops-accent transition-all block">
                          <div className="flex items-center gap-3 mb-2">
                            {player.user.image ? (
                              <img src={player.user.image} alt={player.fullName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{player.fullName}</p>
                              <p className="text-sm text-gray-600">{player.position || 'Jugador'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">{player.city}</p>
                            <Badge className={availability.className}>{availability.label}</Badge>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card id="quiero-jugar">
              <CardHeader>
                <CardTitle>Quiero jugar en este club</CardTitle>
              </CardHeader>
              <CardContent>
                <ClubInterestForm
                  clubSlug={club.slug || params.slug}
                  initialValues={{
                    fullName: canPrefillLeadForm ? (currentUser?.talentProfile?.fullName || currentUser?.name || '') : '',
                    age: canPrefillLeadForm ? prefillAge : null,
                    position: canPrefillLeadForm ? (currentUser?.talentProfile?.position || '') : '',
                    height: canPrefillLeadForm ? (currentUser?.talentProfile?.height || null) : null,
                    city: canPrefillLeadForm ? (currentUser?.talentProfile?.city || '') : '',
                    email: canPrefillLeadForm ? (currentUser?.email || '') : '',
                    phone: ''
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Redes y contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.website && (
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-workhoops-accent hover:underline">
                    <Globe className="w-4 h-4 mr-2" /> Sitio web
                  </a>
                )}
                {club.instagramUrl && (
                  <a href={club.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-workhoops-accent hover:underline">
                    <Instagram className="w-4 h-4 mr-2" /> Instagram
                  </a>
                )}
                {club.twitterUrl && (
                  <a href={club.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-workhoops-accent hover:underline">
                    <Twitter className="w-4 h-4 mr-2" /> X / Twitter
                  </a>
                )}
                {club.linkedinUrl && (
                  <a href={club.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-workhoops-accent hover:underline">
                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                  </a>
                )}
                {club.youtubeUrl && (
                  <a href={club.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-workhoops-accent hover:underline">
                    <Youtube className="w-4 h-4 mr-2" /> YouTube
                  </a>
                )}
                {!club.website && !club.instagramUrl && !club.twitterUrl && !club.linkedinUrl && !club.youtubeUrl && (
                  <p className="text-sm text-gray-500">El club aún no ha añadido enlaces públicos.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/talento/perfiles" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Buscar jugadores
                  </Button>
                </Link>
                <a href="#quiero-jugar" className="block">
                  <Button className="w-full bg-workhoops-accent hover:bg-orange-600">
                    Quiero jugar en este club
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
