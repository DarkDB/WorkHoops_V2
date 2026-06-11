import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Clock, ChevronRight, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { prisma } from '@/lib/prisma'
import { getOpportunityTypeLabel, getOpportunityLevelLabel, formatRelativeTime } from '@/lib/utils'

export const revalidate = 3600 // Revalidate every hour

// ─── Slug → DB field mappings ─────────────────────────────────────────────

const POSITION_MAP: Record<string, { label: string; db: string[] }> = {
  'base': { label: 'Base (Point Guard)', db: ['Base', 'base', 'Base (Point Guard)', 'Point Guard'] },
  'escolta': { label: 'Escolta (Shooting Guard)', db: ['Escolta', 'escolta', 'Shooting Guard'] },
  'alero': { label: 'Alero (Small Forward)', db: ['Alero', 'alero', 'Small Forward'] },
  'ala-pivot': { label: 'Ala-Pívot', db: ['Ala-Pívot', 'Ala-Pivot', 'Power Forward'] },
  'pivot': { label: 'Pívot (Center)', db: ['Pívot', 'Pivot', 'Center', 'pívot'] },
  'entrenador': { label: 'Entrenador/a', db: ['Entrenador/a', 'Entrenador', 'entrenador'] },
  'preparador-fisico': { label: 'Preparador Físico', db: ['Preparador Físico', 'Preparador Fisico'] },
  'fisioterapeuta': { label: 'Fisioterapeuta', db: ['Fisioterapeuta'] },
}

const LEVEL_MAP: Record<string, { label: string; db: string }> = {
  'acb': { label: 'ACB', db: 'profesional' },
  'leb-oro': { label: 'LEB Oro', db: 'profesional' },
  'primera-feb': { label: '1ª FEB', db: 'profesional' },
  'segunda-feb': { label: '2ª FEB', db: 'semi_profesional' },
  'tercera-feb': { label: '3ª FEB', db: 'semi_profesional' },
  '3a-feb': { label: '3ª FEB', db: 'semi_profesional' },
  'autonomica': { label: 'Autonómica', db: 'amateur' },
  'provincial': { label: 'Provincial', db: 'amateur' },
  'cantera': { label: 'Cantera', db: 'cantera' },
  'amateur': { label: 'Amateur', db: 'amateur' },
}

const CITY_MAP: Record<string, string> = {
  'madrid': 'Madrid',
  'barcelona': 'Barcelona',
  'valencia': 'Valencia',
  'sevilla': 'Sevilla',
  'bilbao': 'Bilbao',
  'zaragoza': 'Zaragoza',
  'malaga': 'Málaga',
  'murcia': 'Murcia',
  'granada': 'Granada',
  'alicante': 'Alicante',
  'leon': 'León',
  'burgos': 'Burgos',
  'gijon': 'Gijón',
  'oviedo': 'Oviedo',
  'cantabria': 'Cantabria',
  'pamplona': 'Pamplona',
  'vitoria': 'Vitoria',
  'san-sebastian': 'San Sebastián',
  'la-coruna': 'La Coruña',
  'vigo': 'Vigo',
  'palma': 'Palma',
  'tenerife': 'Tenerife',
  'las-palmas': 'Las Palmas',
  'argentina': 'Argentina',
  'mexico': 'México',
  'colombia': 'Colombia',
}

interface ParsedSlug {
  position?: { label: string; db: string[] }
  level?: { label: string; db: string }
  city?: string
  rawParts: string[]
}

function parseSlug(slug: string): ParsedSlug | null {
  const parts = slug.toLowerCase().split('-')
  const result: ParsedSlug = { rawParts: parts }

  // Try to match full slug first, then progressively shorter
  const fullSlug = slug.toLowerCase()

  // Check position (try multi-word first)
  for (const [key, val] of Object.entries(POSITION_MAP)) {
    if (fullSlug.includes(key)) {
      result.position = val
      break
    }
  }

  // Check level
  for (const [key, val] of Object.entries(LEVEL_MAP)) {
    if (fullSlug.includes(key)) {
      result.level = val
      break
    }
  }

  // Check city (try multi-word cities first)
  const sortedCities = Object.keys(CITY_MAP).sort((a, b) => b.length - a.length)
  for (const key of sortedCities) {
    if (fullSlug.includes(key)) {
      result.city = CITY_MAP[key]
      break
    }
  }

  // Must match at least one filter
  if (!result.position && !result.level && !result.city) {
    return null
  }

  return result
}

function buildPageTitle(parsed: ParsedSlug): string {
  const parts: string[] = []
  if (parsed.position) parts.push(`${parsed.position.label}`)
  if (parsed.level) parts.push(parsed.level.label)
  if (parsed.city) parts.push(parsed.city)

  if (parts.length === 0) return 'Ofertas de baloncesto'
  if (parts.length === 1) return `Trabajo de ${parts[0]} en baloncesto`
  return `Trabajo de ${parts.join(' · ')}`
}

function buildMetaDescription(parsed: ParsedSlug, count: number): string {
  const parts: string[] = []
  if (parsed.position) parts.push(parsed.position.label)
  if (parsed.level) parts.push(parsed.level.label)
  if (parsed.city) parts.push(parsed.city)

  const context = parts.join(', ')
  if (count > 0) {
    return `${count} oferta${count !== 1 ? 's' : ''} de baloncesto para ${context} en WorkHoops. Aplica gratis y conecta con clubes que buscan jugadores ahora mismo.`
  }
  return `Encuentra trabajo de baloncesto como ${context} en España y LATAM. WorkHoops conecta jugadores con clubes. Regístrate gratis.`
}

// ─── Static params for most common combinations ────────────────────────────

export async function generateStaticParams() {
  const positions = ['base', 'escolta', 'alero', 'pivot', 'entrenador']
  const levels = ['tercera-feb', 'segunda-feb', 'primera-feb', 'autonomica']
  const cities = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao']

  const params: { slug: string }[] = []

  // position only
  for (const p of positions) {
    params.push({ slug: p })
  }
  // position + level
  for (const p of positions) {
    for (const l of levels) {
      params.push({ slug: `${p}-${l}` })
    }
  }
  // position + city
  for (const p of positions) {
    for (const c of cities) {
      params.push({ slug: `${p}-${c}` })
    }
  }
  // position + level + city (top combinations)
  for (const p of ['base', 'pivot', 'entrenador']) {
    for (const l of ['tercera-feb', 'segunda-feb']) {
      for (const c of ['madrid', 'barcelona']) {
        params.push({ slug: `${p}-${l}-${c}` })
      }
    }
  }

  return params
}

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parsed = parseSlug(params.slug)
  if (!parsed) return { title: 'WorkHoops' }

  const title = buildPageTitle(parsed)
  const description = buildMetaDescription(parsed, 0)

  return {
    title: `${title} | WorkHoops`,
    description,
    openGraph: {
      title: `${title} | WorkHoops`,
      description,
      url: `https://workhoops.es/trabajo/${params.slug}`,
    },
    alternates: {
      canonical: `https://workhoops.es/trabajo/${params.slug}`,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function TrabajoSlugPage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug)
  if (!parsed) notFound()

  // Build DB query
  const where: any = {
    status: 'publicada',
    publishedAt: { not: null },
    OR: [
      { deadline: null },
      { deadline: { gte: new Date() } },
    ],
  }

  if (parsed.level) {
    where.level = parsed.level.db
  }

  if (parsed.city) {
    where.city = { contains: parsed.city, mode: 'insensitive' }
  }

  if (parsed.position) {
    where.tags = { hasSome: parsed.position.db }
    // Also try matching title for positions
    delete where.tags
    where.OR = [
      ...(where.OR || []),
      { title: { contains: parsed.position.db[0], mode: 'insensitive' } },
      { description: { contains: parsed.position.db[0], mode: 'insensitive' } },
      ...(parsed.level || parsed.city ? [] : [{ tags: { hasSome: parsed.position.db } }]),
    ]
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy: [{ publishedAt: 'desc' }],
    take: 20,
    include: {
      author: {
        select: {
          name: true,
          clubAgencyProfile: { select: { commercialName: true } },
        },
      },
    },
  })

  const pageTitle = buildPageTitle(parsed)
  const metaDesc = buildMetaDescription(parsed, opportunities.length)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero SEO block */}
      <section className="bg-workhoops-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-400 mb-4 gap-1">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/oportunidades" className="hover:text-white transition-colors">Ofertas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{pageTitle}</span>
          </nav>

          <h1 className="text-3xl lg:text-4xl font-black mb-3">{pageTitle}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{metaDesc}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            {parsed.position && (
              <Badge className="bg-orange-500 text-white border-0 text-sm px-3 py-1">
                {parsed.position.label}
              </Badge>
            )}
            {parsed.level && (
              <Badge className="bg-blue-600 text-white border-0 text-sm px-3 py-1">
                {parsed.level.label}
              </Badge>
            )}
            {parsed.city && (
              <Badge className="bg-gray-600 text-white border-0 text-sm px-3 py-1">
                <MapPin className="w-3 h-3 mr-1 inline" />
                {parsed.city}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results */}
        {opportunities.length > 0 ? (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {opportunities.length} oferta{opportunities.length !== 1 ? 's' : ''} encontrada{opportunities.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4 mb-10">
              {opportunities.map((opp) => {
                const clubName =
                  opp.author?.clubAgencyProfile?.commercialName ||
                  opp.author?.name ||
                  'Club'
                return (
                  <Link key={opp.id} href={`/oportunidades/${opp.slug}`}>
                    <div className="bg-white rounded-xl border border-gray-200 hover:border-workhoops-accent hover:shadow-md transition-all p-5 cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getOpportunityTypeLabel(opp.type)}
                            </Badge>
                          </div>
                          <h2 className="font-semibold text-gray-900 text-lg truncate">{opp.title}</h2>
                          <p className="text-gray-500 text-sm mt-1">{clubName}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                            {opp.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {opp.city}
                              </span>
                            )}
                            {opp.level && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {getOpportunityLevelLabel(opp.level)}
                              </span>
                            )}
                            {opp.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(opp.publishedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center mb-10">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No hay ofertas activas ahora mismo para {pageTitle.toLowerCase()}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Regístrate y activa alertas — te avisamos en cuanto salga una oferta nueva.
            </p>
            <Link href="/auth/register">
              <Button className="bg-workhoops-accent hover:bg-orange-600">
                Crear alerta gratuita
              </Button>
            </Link>
          </div>
        )}

        {/* CTA registro */}
        <div className="bg-workhoops-primary rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-3">
            ¿Buscas trabajo de {parsed.position?.label || 'baloncesto'} en España?
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Crea tu perfil gratis en WorkHoops. Los clubes te encuentran a ti —
            sin necesidad de enviar CVs uno a uno.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-workhoops-accent hover:bg-orange-600 text-white w-full sm:w-auto">
                Crear perfil gratis →
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Ver todas las ofertas
              </Button>
            </Link>
          </div>
        </div>

        {/* SEO internal links to related searches */}
        <div className="mt-10">
          <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wide">
            Búsquedas relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {parsed.position && !parsed.level && (
              <>
                {['tercera-feb', 'segunda-feb', 'primera-feb', 'autonomica'].map((l) => (
                  <Link
                    key={l}
                    href={`/trabajo/${parsed.position!.label.toLowerCase().split(' ')[0].replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n').replace('/', '').replace(' ', '-')}-${l}`}
                    className="text-sm text-gray-500 hover:text-workhoops-accent border border-gray-200 rounded-full px-3 py-1 hover:border-workhoops-accent transition-colors"
                  >
                    {parsed.position!.label} {LEVEL_MAP[l]?.label}
                  </Link>
                ))}
              </>
            )}
            {parsed.level && !parsed.city && (
              <>
                {['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao'].map((c) => (
                  <Link
                    key={c}
                    href={`/trabajo/${params.slug}-${c}`}
                    className="text-sm text-gray-500 hover:text-workhoops-accent border border-gray-200 rounded-full px-3 py-1 hover:border-workhoops-accent transition-colors"
                  >
                    {pageTitle} en {CITY_MAP[c]}
                  </Link>
                ))}
              </>
            )}
            {!parsed.position && (
              <>
                {['base', 'escolta', 'alero', 'pivot', 'entrenador'].map((p) => (
                  <Link
                    key={p}
                    href={`/trabajo/${p}${parsed.level ? '-' + Object.entries(LEVEL_MAP).find(([, v]) => v.db === parsed.level?.db)?.[0] || '' : ''}${parsed.city ? '-' + Object.entries(CITY_MAP).find(([, v]) => v === parsed.city)?.[0] || '' : ''}`}
                    className="text-sm text-gray-500 hover:text-workhoops-accent border border-gray-200 rounded-full px-3 py-1 hover:border-workhoops-accent transition-colors"
                  >
                    {POSITION_MAP[p].label}
                    {parsed.level ? ` ${parsed.level.label}` : ''}
                    {parsed.city ? ` ${parsed.city}` : ''}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
