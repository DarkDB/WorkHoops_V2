import { Suspense } from 'react'
import Link from 'next/link'
import { Search, Filter, MapPin, Clock, CheckCircle, Inbox, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { EmptyState } from '@/components/EmptyState'
import { prisma } from '@/lib/prisma'
import { 
  getOpportunityTypeLabel, 
  getOpportunityTypeColor, 
  getOpportunityLevelLabel,
  formatRelativeTime 
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface OpportunitiesPageProps {
  searchParams: {
    type?: string
    level?: string
    city?: string
    search?: string
    page?: string
    includeExpired?: string
  }
}

// Helper to check if deadline has passed
function isExpired(deadline: Date | null): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

async function getOpportunities(searchParams: OpportunitiesPageProps['searchParams']) {
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const limit = 12
  const skip = (page - 1) * limit
  const includeExpired = searchParams.includeExpired === 'true'

  const where: any = {
    status: 'publicada',
    publishedAt: { not: null },
  }

  // Only filter by deadline if NOT including expired
  if (!includeExpired) {
    where.OR = [
      { deadline: null },
      { deadline: { gte: new Date() } }
    ]
  }

  if (searchParams.type) where.type = searchParams.type
  if (searchParams.level) where.level = searchParams.level
  if (searchParams.city) {
    where.city = { contains: searchParams.city }
  }
  if (searchParams.search) {
    // Combine with existing OR conditions
    const searchConditions = [
      { title: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
      { tags: { contains: searchParams.search } },
    ]
    
    if (where.OR && !includeExpired) {
      // Wrap both conditions with AND
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions }
      ]
      delete where.OR
    } else {
      where.OR = searchConditions
    }
  }

  try {
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
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
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ])

    return {
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return {
      opportunities: [],
      pagination: { page: 1, limit, total: 0, pages: 0 },
    }
  }
}

function OpportunityCard({ opportunity }: { opportunity: any }) {
  const expired = isExpired(opportunity.deadline)
  
  return (
    <Card className={`hover:shadow-lg transition-shadow ${expired ? 'opacity-75 bg-gray-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getOpportunityTypeColor(opportunity.type)}>
              {getOpportunityTypeLabel(opportunity.type)}
            </Badge>
            {expired && (
              <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                Plazo cerrado
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {opportunity.featured && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Destacado
              </Badge>
            )}
            {opportunity.verified && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
        
        <CardTitle className={`text-lg line-clamp-2 mb-2 ${expired ? 'text-gray-600' : ''}`}>
          {opportunity.title}
        </CardTitle>
        
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          {opportunity.organization?.logo && (
            <img 
              src={opportunity.organization.logo}
              alt={opportunity.organization.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          )}
          <span>{opportunity.organization?.name || 'Organizador individual'}</span>
          {opportunity.organization?.verified && (
            <CheckCircle className="w-3 h-3 text-blue-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {opportunity.city}
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Nivel:</strong> {getOpportunityLevelLabel(opportunity.level)}
          </div>
          
          {opportunity.remuneration && (
            <div className="text-sm font-medium text-green-700">
              💰 {typeof opportunity.remuneration === 'object' 
                ? `${opportunity.remuneration.min || 0}-${opportunity.remuneration.max || 0}€`
                : opportunity.remuneration}
            </div>
          )}
          
          {opportunity.deadline && (
            <div className={`flex items-center text-sm ${expired ? 'text-gray-500' : 'text-orange-600'}`}>
              <Clock className="w-4 h-4 mr-2" />
              {expired ? 'Cerrado' : 'Hasta'} {formatRelativeTime(opportunity.deadline)}
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            👥 {opportunity._count.applications} aplicaciones
          </div>
        </div>
        
        <Link href={`/oportunidades/${opportunity.slug}`}>
          <Button className="w-full" variant={expired ? 'outline' : 'default'}>
            {expired ? 'Ver detalles' : 'Ver detalles'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function OpportunitiesLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const { opportunities, pagination } = await getOpportunities(searchParams)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Oportunidades de baloncesto
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Encuentra tu próxima oportunidad en el baloncesto español
              </p>
            </div>
            
            <Link href="/publicar">
              <Button className="hidden sm:flex">
                Publicar oportunidad
              </Button>
            </Link>
          </div>
          
          {/* Simple search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar oportunidades..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-workhoops-accent focus:border-transparent"
                defaultValue={searchParams.search || ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {pagination.total} oportunidades encontradas
          </div>
          
          {/* Quick filters */}
          <div className="hidden md:flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Link href="/oportunidades?type=empleo">
              <Badge variant={searchParams.type === 'empleo' ? 'default' : 'outline'}>
                Empleo
              </Badge>
            </Link>
            <Link href="/oportunidades?type=prueba">
              <Badge variant={searchParams.type === 'prueba' ? 'default' : 'outline'}>
                Pruebas
              </Badge>
            </Link>
            <Link href="/oportunidades?type=torneo">
              <Badge variant={searchParams.type === 'torneo' ? 'default' : 'outline'}>
                Torneos
              </Badge>
            </Link>
          </div>
        </div>

        {/* Opportunities grid */}
        <Suspense fallback={<OpportunitiesLoading />}>
          {opportunities.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No se encontraron oportunidades"
              description={
                searchParams.search || searchParams.type || searchParams.level || searchParams.city
                  ? "Prueba a ajustar los filtros de búsqueda para ver más resultados"
                  : "Aún no hay oportunidades publicadas. ¡Sé el primero en publicar una!"
              }
              actionLabel="Publicar oportunidad"
              actionHref="/publicar"
              secondaryActionLabel="Ver todas"
              secondaryActionHref="/oportunidades"
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-stagger">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </Suspense>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Link key={pageNum} href={`/oportunidades?page=${pageNum}`}>
                  <Button 
                    variant={pageNum === pagination.page ? 'default' : 'outline'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
        
        {/* Mobile publish button */}
        <div className="mt-8 sm:hidden text-center">
          <Link href="/publicar">
            <Button className="w-full">
              Publicar oportunidad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}