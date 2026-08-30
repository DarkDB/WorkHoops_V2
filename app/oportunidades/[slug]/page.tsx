import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import type { Metadata } from 'next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/shared/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RegistrationGate } from '@/components/auth/RegistrationGate'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Share2,
  Trophy,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import ApplyButton from './ApplyButton'
import FavoriteButton from './FavoriteButton'
import ShareButton from './ShareButton'
import { formatDate, toValidDate } from '@/lib/utils'

interface PageProps {
  params: {
    slug: string
  }
}

function getPublicPositionSummary(tags: string | null): string | null {
  if (!tags) return null

  const positionTag = tags
    .split(',')
    .map((tag) => tag.trim())
    .find((tag) => tag.toLowerCase().startsWith('posición:'))

  return positionTag?.slice('posición:'.length).trim() || null
}

function getListItems(value: string | null): string[] {
  if (!value) return []

  return value
    .split(/[;\n•]/)
    .map((item) => item.trim().replace(/^[\-–]\s*/, ''))
    .filter(Boolean)
}

function getProfileTags(tags: string | null): string[] {
  const benefitKeywords = [
    'alojamiento',
    'vivienda',
    'manutención',
    'comida',
    'transporte',
    'gratificación',
    'compensación',
    'seguro',
    'viaje',
  ]

  return (tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !benefitKeywords.some((keyword) => tag.toLowerCase().includes(keyword)))
}

function getLocationLabel(city: string | null, country: string | null): string {
  return [city, country].filter(Boolean).join(', ') || 'Ubicación por concretar'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      city: true,
      benefits: true,
    },
  })

  if (!opportunity) {
    return { title: 'Oportunidad de baloncesto | WorkHoops' }
  }

  const isWomenNationalLeague = /1[ªa]\s*nacional\s*femenina/i.test(opportunity.title)
  const hasAccommodation = opportunity.benefits?.toLowerCase().includes('alojamiento')
  const hasCompensation = opportunity.benefits?.toLowerCase().includes('gratificaci')

  return {
    title: `${opportunity.title} | WorkHoops`,
    description: isWomenNationalLeague
      ? `Club de 1ª Nacional Femenina busca jugadora en ${opportunity.city || 'España'}${hasAccommodation ? '. Alojamiento incluido' : ''}${hasCompensation ? ' y gratificación' : ''}. Consulta requisitos y condiciones en WorkHoops.`
      : `Oportunidad de baloncesto en ${opportunity.city || 'España'}. Consulta requisitos y condiciones en WorkHoops.`,
  }
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session?.user?.id)

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: params.slug },
    include: {
      organization: true,
      author: {
        select: {
          name: true,
          email: true,
          clubAgencyProfile: {
            select: {
              slug: true,
              legalName: true,
              commercialName: true,
              city: true,
              logo: true,
              verified: true,
            },
          },
        },
      },
      applications: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
          }
        : false,
      favorites: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
          }
        : false,
    },
  })

  if (!opportunity) {
    notFound()
  }

  const hasApplied = Boolean(
    isAuthenticated && Array.isArray(opportunity.applications) && opportunity.applications.length > 0,
  )
  const isFavorited = Boolean(
    isAuthenticated && Array.isArray(opportunity.favorites) && opportunity.favorites.length > 0,
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'empleo':
        return 'Empleo'
      case 'prueba':
        return 'Prueba'
      case 'torneo':
        return 'Torneo'
      case 'clinica':
        return 'Clínica'
      case 'beca':
        return 'Beca'
      default:
        return type
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'base':
        return 'Iniciación'
      case 'amateur':
        return 'Amateur'
      case 'semi_profesional':
        return 'Semi-profesional'
      case 'profesional':
        return 'Profesional'
      default:
        return level
    }
  }

  const formatRemuneration = () => {
    if (opportunity.remunerationMin === null) return 'Consulta las condiciones en la descripción'

    const min = opportunity.remunerationMin
    const max = opportunity.remunerationMax
    const type = opportunity.remunerationType

    let suffix = ''
    switch (type) {
      case 'hourly':
        suffix = '/hora'
        break
      case 'monthly':
        suffix = '/mes'
        break
      case 'annual':
        suffix = '/año'
        break
    }

    if (max && max !== min) {
      return `€${min} - €${max}${suffix}`
    }
    return `€${min}${suffix}`
  }

  const deadlineDate = toValidDate(opportunity.deadline)
  const isExpired = deadlineDate ? deadlineDate < new Date() : false
  const isWomenNationalLeague = /1[ªa]\s*nacional\s*femenina/i.test(opportunity.title)
  const hasAccommodation = opportunity.benefits?.toLowerCase().includes('alojamiento') || false
  const hasCompensation = opportunity.benefits?.toLowerCase().includes('gratificaci') || false
  const publicPositionSummary = getPublicPositionSummary(opportunity.tags)
  const benefitItems = getListItems(opportunity.benefits)
  const profileTags = getProfileTags(opportunity.tags)
  const location = getLocationLabel(opportunity.city, opportunity.country)
  const clubProfile = opportunity.author?.clubAgencyProfile
  const clubName = opportunity.organization?.name || clubProfile?.commercialName || clubProfile?.legalName || opportunity.author?.name
  const clubLogo = opportunity.organization?.logo || clubProfile?.logo
  const clubVerified = opportunity.organization?.verified || clubProfile?.verified
  const clubLocation = clubProfile ? getLocationLabel(clubProfile.city, null) : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6">
          <Link href="/oportunidades">
            <Button variant="ghost" size="sm" className="-ml-3 text-slate-600 hover:text-slate-950">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a oportunidades
            </Button>
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-workhoops-accent" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-slate-900 text-white hover:bg-slate-900">{getTypeLabel(opportunity.type)}</Badge>
                {opportunity.verified && (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Verificada
                  </Badge>
                )}
                {isExpired ? (
                  <Badge className="border-red-200 bg-red-50 text-red-800 hover:bg-red-50">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    Plazo cerrado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    Oferta abierta
                  </Badge>
                )}
              </div>

              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl sm:leading-tight">
                {opportunity.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
                <Badge variant="outline" className="gap-1.5 rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-workhoops-accent" />
                  {location}
                </Badge>
                <Badge variant="outline" className="gap-1.5 rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                  <Trophy className="h-3.5 w-3.5 text-workhoops-accent" />
                  {getLevelLabel(opportunity.level)}
                </Badge>
                {publicPositionSummary && (
                  <Badge variant="outline" className="gap-1.5 rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                    <Users className="h-3.5 w-3.5 text-workhoops-accent" />
                    {publicPositionSummary}
                  </Badge>
                )}
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 capitalize text-slate-700">
                  {opportunity.modality}
                </Badge>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-600">
                {isAuthenticated ? clubName || 'Club de baloncesto' : 'Club de baloncesto'}
                {clubVerified && isAuthenticated && <CheckCircle className="ml-1 inline h-4 w-4 text-blue-600" />}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start">
              {isAuthenticated && (
                <FavoriteButton opportunityId={opportunity.id} isFavorited={isFavorited} isLoggedIn />
              )}
              <ShareButton
                opportunityTitle={opportunity.title}
                opportunityUrl={`${process.env.APP_URL || 'https://workhoops.es'}/oportunidades/${opportunity.slug}`}
              />
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,0.9fr)] lg:items-start">
          <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-24">
            {isAuthenticated ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-workhoops-accent">Candidatura</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">¿Te interesa esta oportunidad?</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Presenta tu perfil al club directamente desde WorkHoops.
                  </p>
                  <div className="mt-5">
                    <ApplyButton
                      opportunityId={opportunity.id}
                      hasApplied={hasApplied}
                      deadline={opportunity.deadline}
                      applicationUrl={opportunity.applicationUrl}
                    />
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Al presentar tu candidatura, el club recibirá la información de tu perfil.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <RegistrationGate slug={params.slug} />
            )}

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-base font-bold text-slate-950">Resumen de la oportunidad</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-workhoops-accent" />
                    <div>
                      <dt className="text-slate-500">Ubicación</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">{location}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-workhoops-accent" />
                    <div>
                      <dt className="text-slate-500">Nivel</dt>
                      <dd className="mt-0.5 font-medium text-slate-900">{getLevelLabel(opportunity.level)}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-workhoops-accent" />
                    <div>
                      <dt className="text-slate-500">Modalidad</dt>
                      <dd className="mt-0.5 capitalize font-medium text-slate-900">{opportunity.modality}</dd>
                    </div>
                  </div>
                  {deadlineDate && (
                    <div className="flex gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-workhoops-accent" />
                      <div>
                        <dt className="text-slate-500">Fecha límite</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{formatDate(deadlineDate)}</dd>
                      </div>
                    </div>
                  )}
                  {opportunity.publishedAt && (
                    <div className="flex gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-workhoops-accent" />
                      <div>
                        <dt className="text-slate-500">Publicada</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{formatDate(opportunity.publishedAt)}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {isAuthenticated && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-base font-bold text-slate-950">Contacto</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <a href={`mailto:${opportunity.contactEmail}`} className="flex items-center gap-3 text-slate-700 hover:text-workhoops-accent">
                      <Mail className="h-4 w-4 shrink-0 text-workhoops-accent" />
                      <span className="break-all">{opportunity.contactEmail}</span>
                    </a>
                    {opportunity.contactPhone && (
                      <a href={`tel:${opportunity.contactPhone}`} className="flex items-center gap-3 text-slate-700 hover:text-workhoops-accent">
                        <Phone className="h-4 w-4 shrink-0 text-workhoops-accent" />
                        <span>{opportunity.contactPhone}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          <div className="order-2 space-y-7 lg:order-1">
            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">Sobre la oportunidad</h2>
              {!isAuthenticated ? (
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">
                  <p>
                    {isWomenNationalLeague
                      ? 'Oportunidad real para competir en un proyecto de 1ª Nacional Femenina.'
                      : 'Oportunidad real de baloncesto en un proyecto competitivo.'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ubicación</p>
                      <p className="mt-1 font-medium text-slate-900">{location}</p>
                    </div>
                    {publicPositionSummary && (
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Posición</p>
                        <p className="mt-1 font-medium text-slate-900">{publicPositionSummary}</p>
                      </div>
                    )}
                  </div>
                  {(hasAccommodation || hasCompensation) && (
                    <div className="flex flex-wrap gap-2">
                      {hasAccommodation && <Badge className="bg-emerald-50 text-emerald-800 hover:bg-emerald-50">Alojamiento incluido</Badge>}
                      {hasCompensation && <Badge className="bg-emerald-50 text-emerald-800 hover:bg-emerald-50">Incluye gratificación económica</Badge>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-slate mt-4 max-w-none prose-p:leading-7 prose-li:leading-7" dangerouslySetInnerHTML={{ __html: opportunity.description }} />
              )}
            </section>

            {isAuthenticated && profileTags.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Perfil que buscamos</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Requisitos y preferencias indicados por el club.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profileTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-workhoops-accent" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {isAuthenticated && benefitItems.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Lo que ofrece el club</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {benefitItems.map((benefit) => (
                    <div key={benefit} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-workhoops-accent" />
                      <p className="text-sm leading-6 text-slate-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isAuthenticated && clubName && (
              <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Sobre el club</h2>
                <div className="mt-5 flex items-start gap-4">
                  {clubLogo ? (
                    <img src={clubLogo} alt={clubName} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Trophy className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">{clubName}</h3>
                      {clubVerified && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </div>
                    {clubLocation && <p className="mt-1 text-sm text-slate-600">{clubLocation}</p>}
                    {opportunity.organization?.description && <p className="mt-3 text-sm leading-6 text-slate-600">{opportunity.organization.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {clubProfile?.slug && (
                        <Link href={`/club/${clubProfile.slug}`}>
                          <Button variant="outline" size="sm">Ver perfil del club</Button>
                        </Link>
                      )}
                      {opportunity.organization?.website && (
                        <Link href={opportunity.organization.website} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visitar web
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
