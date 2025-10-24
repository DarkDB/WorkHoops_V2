import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

interface PageProps {
  params: {
    slug: string
  }
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
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
  const hasApplied = Boolean(session?.user?.id && Array.isArray(opportunity.applications) && opportunity.applications.length > 0)
  
  // Check if user has favorited this opportunity
  const isFavorited = Boolean(session?.user?.id && Array.isArray(opportunity.favorites) && opportunity.favorites.length > 0)

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
    const now = new Date()
    const deadline = new Date(opportunity.deadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
                {opportunity.organization.logo && (
                  <img 
                    src={opportunity.organization.logo}
                    alt={opportunity.organization.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
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
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {opportunity.title}
                  </h1>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">{opportunity.organization.name}</span>
                    {opportunity.organization.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <FavoriteButton 
                  opportunityId={opportunity.id}
                  isFavorited={isFavorited}
                  isLoggedIn={!!session}
                />
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
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: opportunity.description }}
                />
              </CardContent>
            </Card>

            {/* Organization */}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatRemuneration()}
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
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Fecha límite</dt>
                    <dd className="flex items-center text-sm text-gray-900 mt-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(opportunity.deadline).toLocaleDateString('es-ES')}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Publicado</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {new Date(opportunity.publishedAt).toLocaleDateString('es-ES')}
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {opportunity.contactEmail}
                    </dd>
                  </div>
                  
                  {opportunity.contactPhone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {opportunity.contactPhone}
                      </dd>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}