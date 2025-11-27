import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, User, Calendar, Eye, ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'

const categories = [
  { value: 'preparacion', label: 'Preparación', color: 'bg-blue-100 text-blue-800' },
  { value: 'carrera', label: 'Carrera', color: 'bg-purple-100 text-purple-800' },
  { value: 'recursos', label: 'Recursos', color: 'bg-green-100 text-green-800' },
  { value: 'salud', label: 'Salud', color: 'bg-red-100 text-red-800' },
  { value: 'tactica', label: 'Táctica', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'mental', label: 'Mental', color: 'bg-indigo-100 text-indigo-800' },
]

export default async function RecursoPage({
  params,
}: {
  params: { slug: string }
}) {
  const resource = await prisma.resource.findUnique({
    where: { slug: params.slug },
  })

  if (!resource || resource.status !== 'published') {
    notFound()
  }

  // Incrementar vistas (ya se hace en el API pero por si acaso)
  await prisma.resource.update({
    where: { id: resource.id },
    data: { views: { increment: 1 } }
  })

  // Obtener recursos relacionados (misma categoría)
  const relatedResources = await prisma.resource.findMany({
    where: {
      status: 'published',
      category: resource.category,
      id: { not: resource.id }
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  })

  const catData = categories.find(c => c.value === resource.category) || categories[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/recursos" className="hover:text-workhoops-primary">
              Recursos
            </Link>
            <span>/</span>
            <Link href={`/recursos?category=${resource.category}`} className="hover:text-workhoops-primary">
              {catData.label}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{resource.title}</span>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/recursos">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a recursos
            </Button>
          </Link>

          {/* Header */}
          <header className="mb-8">
            <Badge className={`${catData.color} mb-4`}>
              {catData.label}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {resource.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {resource.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>Por <strong>{resource.author}</strong></span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {resource.readTime} min de lectura
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                {resource.views} vistas
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {resource.featuredImage && (
            <div className="mb-12 rounded-xl overflow-hidden">
              <img
                src={resource.featuredImage}
                alt={resource.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: resource.content }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
            }}
          />

          {/* Share */}
          <div className="flex items-center justify-between py-8 border-t border-b">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Te ha sido útil?</h3>
              <p className="text-sm text-gray-600">Comparte este artículo con otros</p>
            </div>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Related Articles */}
          {relatedResources.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Artículos relacionados
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedResources.map(related => (
                  <Link key={related.id} href={`/recursos/${related.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      {related.featuredImage && (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={related.featuredImage}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-workhoops-primary transition-colors">
                          {related.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {related.readTime} min
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <Card className="mt-16 bg-gradient-to-r from-workhoops-primary to-workhoops-accent text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                ¿Listo para dar el siguiente paso?
              </h2>
              <p className="text-white/90 mb-6">
                Explora oportunidades profesionales en clubes de toda España
              </p>
              <Link href="/oportunidades">
                <Button size="lg" variant="secondary">
                  Ver Oportunidades
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </article>
    </div>
  )
}

// Comentado para evitar problemas en build time
// export async function generateStaticParams() {
//   const resources = await prisma.resource.findMany({
//     where: { status: 'published' },
//     select: { slug: true },
//   })

//   return resources.map((resource) => ({
//     slug: resource.slug,
//   }))
// }
