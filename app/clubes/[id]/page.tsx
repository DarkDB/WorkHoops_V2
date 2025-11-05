import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Briefcase, CheckCircle, Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ClubProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  // Fetch club data
  const club = await prisma.user.findUnique({
    where: { 
      id: params.id,
      role: {
        in: ['club', 'agencia']
      }
    },
    include: {
      clubAgencyProfile: true,
      opportunities: {
        where: {
          status: 'publicada'
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          level: true,
          city: true,
          deadline: true,
          createdAt: true
        }
      }
    }
  })

  if (!club || !club.clubAgencyProfile) {
    notFound()
  }

  const profile = club.clubAgencyProfile

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'club_deportivo': 'Club Deportivo',
      'agencia_representacion': 'Agencia de Representación',
      'federacion': 'Federación',
      'academia': 'Academia/Escuela',
      'empresa': 'Empresa'
    }
    return labels[type] || type
  }

  const getOpportunityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'empleo': 'Empleo',
      'prueba': 'Prueba',
      'torneo': 'Torneo',
      'clinica': 'Clínica',
      'campus': 'Campus',
      'beca': 'Beca',
      'patrocinio': 'Patrocinio'
    }
    return labels[type] || type
  }

  const canContact = club.planType === 'pro_semipro' || club.planType === 'destacado'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link 
          href="/clubes"
          className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a clubes
        </Link>

        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile.logo ? (
                  <img 
                    src={profile.logo} 
                    alt={profile.legalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {club.planType === 'destacado' && (
                    <Badge className="bg-workhoops-accent">
                      <Star className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                  {club.verified && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {getEntityTypeLabel(profile.entityType)}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.legalName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.city}
                  </div>
                  {club.opportunities.length > 0 && (
                    <div className="flex items-center text-workhoops-accent font-medium">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {club.opportunities.length} {club.opportunities.length === 1 ? 'oferta activa' : 'ofertas activas'}
                    </div>
                  )}
                </div>

                {/* Botones de acción según el rol del usuario */}
                <div className="flex flex-wrap gap-3">
                  {/* Caso 6: Club/Agencia en su propio perfil */}
                  {session?.user?.id === club.id && (
                    <>
                      {club.planType === 'destacado' ? (
                        <Button size="sm" variant="default" className="bg-workhoops-accent" disabled>
                          <Star className="w-4 h-4 mr-2" />
                          Club Destacado
                        </Button>
                      ) : (
                        <Link href="/planes">
                          <Button size="sm" variant="default" className="bg-workhoops-accent">
                            <Star className="w-4 h-4 mr-2" />
                            Activar Plan Destacado
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                  
                  {/* Caso 5: Club/Agencia viendo otro club/agencia - NO mostrar botones de contacto */}
                  {/* Solo mostrar botones si NO es club/agencia O si es su propio perfil con plan Pro */}
                  {session?.user?.id !== club.id && 
                   session?.user?.role !== 'club' && 
                   session?.user?.role !== 'agencia' && 
                   canContact && (
                    <>
                      {profile.contactEmail && (
                        <a href={`mailto:${profile.contactEmail}`}>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Contactar
                          </Button>
                        </a>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Globe className="w-4 h-4 mr-2" />
                            Web
                          </Button>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {profile.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre nosotros</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Opportunities */}
            {club.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-workhoops-accent" />
                    Ofertas Publicadas ({club.opportunities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {club.opportunities.map((opportunity) => (
                      <Link 
                        key={opportunity.id} 
                        href={`/oportunidades/${opportunity.slug}`}
                        className="block"
                      >
                        <div className="border rounded-lg p-4 hover:border-workhoops-accent hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {opportunity.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline" className="text-xs">
                                  {getOpportunityTypeLabel(opportunity.type)}
                                </Badge>
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {opportunity.city}
                                </span>
                                {opportunity.level && (
                                  <span>• {opportunity.level}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              Publicada {new Date(opportunity.createdAt).toLocaleDateString('es-ES')}
                            </span>
                            <Button size="sm" variant="ghost" className="text-workhoops-accent">
                              Ver oferta
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {club.opportunities.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">
                    Este club no tiene ofertas activas en este momento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.contactEmail && (
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a 
                        href={`mailto:${profile.contactEmail}`}
                        className="text-sm font-medium text-workhoops-accent hover:underline break-all"
                      >
                        {profile.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {profile.contactPhone && (
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                      <a 
                        href={`tel:${profile.contactPhone}`}
                        className="text-sm font-medium text-workhoops-accent hover:underline"
                      >
                        {profile.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-start">
                    <Globe className="w-4 h-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Sitio web</p>
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-workhoops-accent hover:underline break-all"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}

                {!canContact && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600">
                      <CheckCircle className="w-4 h-4 inline mr-1 text-orange-500" />
                      Información de contacto visible solo para usuarios con plan Pro
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profiles Needed */}
            {profile.profilesNeeded && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perfiles buscados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {profile.profilesNeeded}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
