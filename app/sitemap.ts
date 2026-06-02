import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.APP_URL || 'https://workhoops.es'

const PAISES = ['espana', 'mexico', 'argentina', 'colombia']
const POSICIONES = ['base', 'escolta', 'alero', 'pivot', 'entrenador']

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

  return [...staticPages, ...paisPages, ...posicionPages, ...opportunityPages]
}
