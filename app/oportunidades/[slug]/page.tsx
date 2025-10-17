import { notFound } from 'next/navigation'
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
  Euro
} from 'lucide-react'
import Link from 'next/link'

// Mock data - en una app real vendría de la base de datos usando el slug
const mockOpportunity = {
  id: '1',
  title: 'Jugador Base - CB Estudiantes',
  slug: 'jugador-base-cb-estudiantes',
  description: `
    <h3>Descripción del puesto:</h3>
    <p>Buscamos un jugador base con experiencia para nuestro equipo de LEB Oro. El candidato ideal debe tener:</p>
    
    <h4>Requisitos:</h4>
    <ul>
      <li>Mínimo 2 años de experiencia en competición senior</li>
      <li>Altura entre 1.75m - 1.85m</li>
      <li>Excelente visión de juego y capacidad de liderazgo</li>
      <li>Disponibilidad para entrenar de lunes a viernes</li>
      <li>Residencia en Madrid o disponibilidad para mudarse</li>
    </ul>
    
    <h4>Ofrecemos:</h4>
    <ul>
      <li>Contrato profesional por temporada</li>
      <li>Seguro médico completo</li>
      <li>Alojamiento incluido</li>
      <li>Cuerpo técnico de alto nivel</li>
      <li>Proyección hacia categorías superiores</li>
    </ul>
    
    <h4>Proceso de selección:</h4>
    <p>Las pruebas se realizarán los días 15 y 16 de octubre en nuestras instalaciones. Es necesario traer certificado médico y equipación completa.</p>
  `,
  type: 'empleo',
  status: 'publicada',
  level: 'semi_profesional',
  city: 'Madrid',
  country: 'España',
  modality: 'presencial',
  remunerationType: 'monthly',
  remunerationMin: 800,
  remunerationMax: 1200,
  currency: 'EUR',
  deadline: '2024-10-15T23:59:59.000Z',
  publishedAt: '2024-09-15T10:00:00.000Z',
  contactEmail: 'cantera@cbestudiantes.com',
  contactPhone: '+34 600 123 456',
  applicationUrl: 'https://cbestudiantes.com/aplicar',
  organization: {
    id: 'org-1',
    name: 'CB Estudiantes',
    description: 'Club de baloncesto con más de 70 años de historia en Madrid.',
    logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop&crop=center',
    verified: true,
    website: 'https://cbestudiantes.com'
  },
  verified: true
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function OpportunityDetailPage({ params }: PageProps) {
  // En una app real, buscarías la oportunidad por slug en la base de datos
  const opportunity = mockOpportunity
  
  if (!opportunity) {
    notFound()
  }

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
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
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
                  
                  {daysUntilDeadline() > 0 ? (
                    <div className="text-sm text-orange-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {daysUntilDeadline()} días para aplicar
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Plazo cerrado
                    </div>
                  )}
                  
                  <Button className="w-full" size="lg" disabled={daysUntilDeadline() <= 0}>
                    Aplicar ahora
                  </Button>
                  
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