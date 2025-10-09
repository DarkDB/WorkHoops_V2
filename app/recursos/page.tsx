import Link from 'next/link'
import { Clock, User, ArrowRight, BookOpen, Video, FileText, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

// Datos de ejemplo para artículos
const articles = [
  {
    id: 1,
    title: "Cómo prepararte para una prueba de baloncesto profesional",
    excerpt: "Guía completa con ejercicios específicos, preparación mental y consejos de expertos para destacar en tu próxima prueba.",
    category: "Preparación",
    readTime: "8 min",
    author: "Carlos Martínez",
    date: "2024-10-01",
    image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: true
  },
  {
    id: 2,
    title: "Plantilla de CV deportivo: Ejemplo práctico",
    excerpt: "Descarga nuestra plantilla gratuita y aprende a estructurar tu experiencia deportiva para impresionar a los reclutadores.",
    category: "Recursos",
    readTime: "5 min",
    author: "Ana García",
    date: "2024-09-28",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: false
  },
  {
    id: 3,
    title: "Cómo negociar tu primer contrato profesional",
    excerpt: "Claves para entender las condiciones, derechos y obligaciones en tu primer contrato como jugador profesional.",
    category: "Carrera",
    readTime: "12 min",
    author: "Miguel Torres",
    date: "2024-09-25",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: true
  },
  {
    id: 4,
    title: "Prevención de lesiones en baloncesto",
    excerpt: "Rutinas de calentamiento, fortalecimiento y estiramientos específicos para evitar las lesiones más comunes.",
    category: "Salud",
    readTime: "10 min",
    author: "Dra. Laura Sánchez",
    date: "2024-09-22",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: false
  },
  {
    id: 5,
    title: "Análisis táctico: Sistemas ofensivos modernos",
    excerpt: "Breakdown de los sistemas ofensivos más utilizados en el baloncesto actual y cómo adaptarse a cada uno.",
    category: "Táctica",
    readTime: "15 min",
    author: "Entrenador José Luis",
    date: "2024-09-20",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: false
  },
  {
    id: 6,
    title: "Preparación mental para competir al máximo nivel",
    excerpt: "Técnicas de visualización, manejo de la presión y construcción de confianza para el alto rendimiento.",
    category: "Mental",
    readTime: "7 min",
    author: "Psicóloga deportiva Elena Ruiz",
    date: "2024-09-18",
    image: "https://images.unsplash.com/photo-1594736797933-d0d64ac2fe65?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=400",
    featured: false
  }
]

const categories = [
  { name: 'Preparación', count: 8, color: 'bg-blue-100 text-blue-800' },
  { name: 'Carrera', count: 6, color: 'bg-green-100 text-green-800' },
  { name: 'Recursos', count: 12, color: 'bg-purple-100 text-purple-800' },
  { name: 'Salud', count: 4, color: 'bg-red-100 text-red-800' },
  { name: 'Táctica', count: 7, color: 'bg-orange-100 text-orange-800' },
  { name: 'Mental', count: 3, color: 'bg-yellow-100 text-yellow-800' }
]

const getCategoryColor = (category: string) => {
  const cat = categories.find(c => c.name === category)
  return cat?.color || 'bg-gray-100 text-gray-800'
}

export default function RecursosPage() {
  const featuredArticles = articles.filter(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                Recursos para tu{' '}
                <span className="text-workhoops-accent">desarrollo profesional</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Guías, plantillas y consejos de expertos para acelerar tu carrera 
                en el mundo del baloncesto profesional
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Badge 
                  key={category.name}
                  className={`${category.color} hover:opacity-80 cursor-pointer px-4 py-2`}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Artículos destacados
              </h2>
              <p className="text-lg text-gray-600">
                Los recursos más populares y actualizados de nuestra comunidad
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {article.author}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-workhoops-accent transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(article.date).toLocaleDateString('es-ES')}
                    </span>
                    <Link href={`/recursos/${article.id}`}>
                      <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-workhoops-accent">
                        Leer más
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Todos los recursos
            </h2>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Ver todas las categorías
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow group">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(article.category)} variant="secondary">
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-workhoops-accent transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="w-3 h-3 mr-1" />
                      {article.author}
                    </div>
                    <Link href={`/recursos/${article.id}`}>
                      <Button size="sm" variant="ghost" className="text-workhoops-accent hover:bg-orange-50">
                        Leer
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Cargar más artículos
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tipos de recursos disponibles
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra el formato que mejor se adapte a tu estilo de aprendizaje
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guías escritas</h3>
              <p className="text-gray-600">
                Artículos en profundidad con pasos detallados y ejemplos prácticos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video tutoriales</h3>
              <p className="text-gray-600">
                Contenido visual con demostraciones y explicaciones paso a paso
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Plantillas y herramientas</h3>
              <p className="text-gray-600">
                Recursos descargables listos para usar en tu carrera profesional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Recibe recursos exclusivos cada semana
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Únete a más de 5,000 profesionales del baloncesto que reciben nuestro newsletter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-workhoops-accent"
            />
            <Button size="lg" variant="secondary">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}