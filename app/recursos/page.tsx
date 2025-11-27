import Link from 'next/link'
import { Clock, User, ArrowRight, BookOpen, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const category = searchParams.category
  const search = searchParams.search

  // Filtros para la consulta
  const where: any = {
    status: 'published'
  }

  if (category && category !== 'all') {
    where.category = category
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Obtener recursos de la BD
  const [featuredResources, allResources] = await Promise.all([
    prisma.resource.findMany({
      where: { ...where, featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.resource.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })
  ])

  const getCategoryData = (cat: string) => {
    return categories.find(c => c.value === cat) || categories[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-workhoops-primary to-workhoops-accent text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 mr-3" />
              <span className="text-xl font-semibold">Recursos WorkHoops</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Guías, consejos y recursos para tu carrera
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Artículos, plantillas y recursos creados por expertos para ayudarte a avanzar en tu carrera deportiva profesional.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/recursos">
                <Badge 
                  variant={!category || category === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  Todos
                </Badge>
              </Link>
              {categories.map(cat => (
                <Link key={cat.value} href={`/recursos?category=${cat.value}`}>
                  <Badge 
                    variant={category === cat.value ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {cat.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Articles */}
        {featuredResources.length > 0 && !search && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Destacados</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredResources.map(resource => {
                const catData = getCategoryData(resource.category)
                return (
                  <Link key={resource.id} href={`/recursos/${resource.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer group">
                      {resource.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={resource.featuredImage}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className={catData.color}>
                              {catData.label}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-workhoops-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {resource.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {resource.author}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {resource.readTime} min
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-workhoops-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {search ? `Resultados para "${search}"` : 'Todos los recursos'}
            </h2>
            <p className="text-gray-600">{allResources.length} artículos</p>
          </div>

          {allResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron recursos
                </h3>
                <p className="text-gray-600 mb-6">
                  {search ? 'Intenta con otros términos de búsqueda' : 'Próximamente agregaremos contenido en esta categoría'}
                </p>
                <Link href="/recursos">
                  <Button>Ver todos los recursos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allResources.map(resource => {
                const catData = getCategoryData(resource.category)
                return (
                  <Link key={resource.id} href={`/recursos/${resource.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer group">
                      {resource.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={resource.featuredImage}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className={catData.color}>
                              {catData.label}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-workhoops-primary transition-colors line-clamp-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {resource.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {resource.readTime} min
                            </span>
                            <span>{resource.views} vistas</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-workhoops-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-workhoops-primary to-workhoops-accent rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Buscas oportunidades?</h2>
          <p className="text-xl mb-8 text-white/90">
            Explora cientos de ofertas de clubes profesionales en toda España
          </p>
          <Link href="/oportunidades">
            <Button size="lg" variant="secondary">
              Ver Oportunidades
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
