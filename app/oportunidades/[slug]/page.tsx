import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import type { Metadata } from 'next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/shared/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RegistrationGate } from '@/components/auth/RegistrationGate'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Heart,
  Share2,
  Euro,
  Building2,
  Mail,
  Phone
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
  
  // Fetch opportunity from database
  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: params.slug },
    include: {
      organization: true,
      author: {
        select: {
          name: true,
          email: true
        }
      },
      applications: session?.user?.id ? {
        where: {
          userId: session.user.id
        }
      } : false,
      favorites: session?.user?.id ? {
        where: {
          userId: session.user.id
        }
      } : false
    }
  })
  
  if (!opportunity) {
    notFound()
  }

  // Check if user has already applied
  const hasApplied = Boolean(isAuthenticated && Array.isArray(opportunity.applications) && opportunity.applications.length > 0)
  
  // Check if user has favorited this opportunity
  const isFavorited = Boolean(isAuthenticated && Array.isArray(opportunity.favorites) && opportunity.favorites.length > 0)

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
    if (!opportunity.remunerationMin) return 'No especificado'
    
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
      default:
        suffix = ''
    }
    
    if (max && max !== min) {
      return `€${min} - €${max}${suffix}`
    }
    return `€${min}${suffix}`
  }

  const daysUntilDeadline = () => {
    const deadline = toValidDate(opportunity.deadline)
    if (!deadline) return null
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Check if deadline has passed
  const deadlineDate = toValidDate(opportunity.deadline)
  const isExpired = deadlineDate ? deadlineDate < new Date() : false
  const isWomenNationalLeague = /1[ªa]\s*nacional\s*femenina/i.test(opportunity.title)
  const hasAccommodation = opportunity.benefits?.toLowerCase().includes('alojamiento')
  const hasCompensation = opportunity.benefits?.toLowerCase().includes('gratificaci')
  const publicPositionSummary = getPublicPositionSummary(opportunity.tags)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/oportunidades">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a oportunidades
            </Button>
          </Link>
        </div>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {isAuthenticated && opportunity.organization?.logo && (
                  <img 
                    src={opportunity.organization.logo}
                    alt={opportunity.organization.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">
                      {getTypeLabel(opportunity.type)}
                    </Badge>
                    <Badge variant="outline">
                      {getLevelLabel(opportunity.level)}
                    </Badge>
                    {opportunity.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificada
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Plazo cerrado
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {opportunity.title}
                  </h1>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">
                      {isAuthenticated
                        ? opportunity.organization?.name || opportunity.author?.name || 'WorkHoops'
                        : 'Club de baloncesto'}
                    </span>
                    {isAuthenticated && opportunity.organization?.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <FavoriteButton
                    opportunityId={opportunity.id}
                    isFavorited={isFavorited}
                    isLoggedIn
                  />
                )}
                <ShareButton 
                  opportunityTitle={opportunity.title}
                  opportunityUrl={`${process.env.APP_URL || 'https://workhoops.es'}/oportunidades/${opportunity.slug}`}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción de la oferta</CardTitle>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      {isWomenNationalLeague
                        ? 'Oportunidad real de baloncesto para competir en un proyecto de 1ª Nacional Femenina.'
                        : 'Oportunidad real de baloncesto en un proyecto competitivo.'}
                    </p>
                    <ul className="space-y-2">
                      <li>Ubicación: {opportunity.city || 'España'}{opportunity.country ? `, ${opportunity.country}` : ''}</li>
                      {publicPositionSummary && <li>Posición: {publicPositionSummary}.</li>}
                      {hasAccommodation && <li>Alojamiento incluido.</li>}
                      {hasCompensation && <li>Incluye gratificación económica.</li>}
                    </ul>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: opportunity.description }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Registration Gate — shown prominently for unauthenticated users */}
            {!isAuthenticated && (
              <RegistrationGate slug={params.slug} />
            )}

            {/* Organization */}
            {isAuthenticated && opportunity.organization && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre la organización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    {opportunity.organization.logo && (
                      <img 
                        src={opportunity.organization.logo}
                        alt={opportunity.organization.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {opportunity.organization.name}
                        </h3>
                        {opportunity.organization.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        {opportunity.organization.description}
                      </p>
                      {opportunity.organization.website && (
                        <Link href={opportunity.organization.website} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visitar web
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="text-lg font-semibold text-gray-900">
                        {opportunity.remunerationMin
                          ? formatRemuneration()
                          : 'Consulta las condiciones económicas en la descripción'}
                      </div>
                      <ApplyButton
                        opportunityId={opportunity.id}
                        hasApplied={hasApplied}
                        deadline={opportunity.deadline}
                        applicationUrl={opportunity.applicationUrl}
                      />
                      <p className="text-xs text-gray-500">
                        Al aplicar, tu perfil será enviado directamente a la organización
                      </p>
                    </>
                  ) : (
                    <Link href={`/auth/register?redirect=${encodeURIComponent(`/oportunidades/${opportunity.slug}`)}`}>
                      <Button className="w-full bg-workhoops-accent hover:bg-orange-600" size="lg">
                        Regístrate gratis para ver la oportunidad completa
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Ubicación</dt>
                    <dd className="flex items-center text-sm text-gray-900 mt-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      {opportunity.city}, {opportunity.country}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Modalidad</dt>
                    <dd className="text-sm text-gray-900 mt-1 capitalize">
                      {opportunity.modality}
                    </dd>
                  </div>
                  
                  {deadlineDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Fecha límite</dt>
                    <dd className="flex items-center text-sm text-gray-900 mt-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(deadlineDate)}
                    </dd>
                  </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Publicado</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {formatDate(opportunity.publishedAt)}
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact - Gated for non-authenticated users */}
            {isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Email</dt>
                      <dd className="flex items-center text-sm text-gray-900 mt-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={`mailto:${opportunity.contactEmail}`} className="text-blue-600 hover:underline">
                          {opportunity.contactEmail}
                        </a>
                      </dd>
                    </div>
                    
                    {opportunity.contactPhone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
                        <dd className="flex items-center text-sm text-gray-900 mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`tel:${opportunity.contactPhone}`} className="text-blue-600 hover:underline">
                            {opportunity.contactPhone}
                          </a>
                        </dd>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
