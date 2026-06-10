import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.APP_URL || 'https://workhoops.es'

const PAISES = ['espana', 'mexico', 'argentina', 'colombia']
const POSICIONES = ['base', 'escolta', 'alero', 'pivot', 'entrenador']

// Programmatic SEO /trabajo/[slug] combinations
const TRABAJO_POSITIONS = ['base', 'escolta', 'alero', 'pivot', 'entrenador']
const TRABAJO_LEVELS = ['tercera-feb', 'segunda-feb', 'primera-feb', 'autonomica']
const TRABAJO_CITIES = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao', 'zaragoza']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/oportunidades`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/publicar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Programmatic SEO: empleo por país
  const paisPages: MetadataRoute.Sitemap = PAISES.map((pais) => ({
    url: `${APP_URL}/empleo/baloncesto/${pais}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Programmatic SEO: empleo por posición
  const posicionPages: MetadataRoute.Sitemap = POSICIONES.map((posicion) => ({
    url: `${APP_URL}/empleo/${posicion}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic: oportunidades from DB
  let opportunityPages: MetadataRoute.Sitemap = []
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'publicada',
        publishedAt: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    })

    opportunityPages = opportunities.map((op) => ({
      url: `${APP_URL}/oportunidades/${op.slug}`,
      lastModified: op.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Sitemap: error fetching opportunities', error)
  }

  // Programmatic SEO: /trabajo/[slug] pages
  const trabajoPages: MetadataRoute.Sitemap = []
  // position only
  for (const p of TRABAJO_POSITIONS) {
    trabajoPages.push({ url: `${APP_URL}/trabajo/${p}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 })
  }
  // position + level
  for (const p of TRABAJO_POSITIONS) {
    for (const l of TRABAJO_LEVELS) {
      trabajoPages.push({ url: `${APP_URL}/trabajo/${p}-${l}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.85 })
    }
  }
  // position + level + city
  for (const p of ['base', 'pivot', 'entrenador']) {
    for (const l of ['tercera-feb', 'segunda-feb']) {
      for (const c of TRABAJO_CITIES) {
        trabajoPages.push({ url: `${APP_URL}/trabajo/${p}-${l}-${c}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 })
      }
    }
  }

  return [...staticPages, ...paisPages, ...posicionPages, ...trabajoPages, ...opportunityPages]
}
