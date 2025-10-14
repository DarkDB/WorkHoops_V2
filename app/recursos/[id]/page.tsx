import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

// Mock data - en una app real vendría de la base de datos
const mockArticles = [
  {
    id: '1',
    title: "Cómo prepararte para una prueba de baloncesto profesional",
    content: `
      <p>Las pruebas de baloncesto profesional son momentos cruciales en la carrera de cualquier jugador. La preparación adecuada puede marcar la diferencia entre conseguir el puesto de tus sueños o quedarte fuera.</p>
      
      <h2>1. Preparación Física</h2>
      <p>Tu condición física debe estar en su punto óptimo. Esto incluye:</p>
      <ul>
        <li><strong>Resistencia cardiovascular:</strong> Entrenamientos de carrera continua y intervalos de alta intensidad</li>
        <li><strong>Fuerza específica:</strong> Ejercicios de salto, agilidad y potencia</li>
        <li><strong>Flexibilidad:</strong> Rutinas de estiramientos para prevenir lesiones</li>
      </ul>
      
      <h2>2. Habilidades Técnicas</h2>
      <p>Repasa y perfecciona los fundamentos:</p>
      <ul>
        <li>Tiro en suspensión desde diferentes distancias</li>
        <li>Manejo de balón con ambas manos</li>
        <li>Pases precisos bajo presión</li>
        <li>Defensa individual y ayudas</li>
      </ul>
      
      <h2>3. Preparación Mental</h2>
      <p>La mentalidad es clave en las pruebas:</p>
      <ul>
        <li>Visualiza situaciones de juego exitosas</li>
        <li>Mantén la confianza en tus habilidades</li>
        <li>Controla los nervios con técnicas de respiración</li>
        <li>Estudia el sistema de juego del equipo</li>
      </ul>
      
      <h2>4. El Día de la Prueba</h2>
      <p>Consejos para destacar durante la evaluación:</p>
      <ul>
        <li>Llega temprano y bien preparado</li>
        <li>Muestra intensidad desde el primer minuto</li>
        <li>Comunícate activamente en la cancha</li>
        <li>Acepta las correcciones del cuerpo técnico</li>
        <li>Mantén una actitud positiva siempre</li>
      </ul>
      
      <h2>Conclusión</h2>
      <p>El éxito en una prueba de baloncesto no depende solo del talento, sino de una preparación integral que incluye aspectos físicos, técnicos y mentales. Dedica tiempo a cada área y verás cómo mejoran tus posibilidades.</p>
    `,
    excerpt: "Guía completa con ejercicios específicos, preparación mental y consejos de expertos para destacar en tu próxima prueba.",
    category: "Preparación",
    readTime: "8 min",
    author: "Carlos Martínez",
    date: "2024-10-01",
    image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800",
    featured: true
  },
  {
    id: '2',
    title: "Plantilla de CV deportivo: Ejemplo práctico",
    content: `
      <p>Tu currículum vitae deportivo es tu carta de presentación ante clubes, entrenadores y cazatalentos. Un CV bien estructurado puede abrirte puertas que pensabas cerradas.</p>
      
      <h2>Estructura Básica del CV Deportivo</h2>
      
      <h3>1. Datos Personales</h3>
      <ul>
        <li>Nombre completo</li>
        <li>Fecha de nacimiento y edad</li>
        <li>Nacionalidad</li>
        <li>Teléfono y email</li>
        <li>Altura, peso y posición</li>
        <li>Foto profesional</li>
      </ul>
      
      <h3>2. Experiencia Deportiva</h3>
      <p>Lista tus equipos en orden cronológico inverso:</p>
      <ul>
        <li>Temporada</li>
        <li>Club/Equipo</li>
        <li>Liga/Categoría</li>
        <li>Estadísticas relevantes</li>
        <li>Logros destacados</li>
      </ul>
      
      <h3>3. Palmarés y Logros</h3>
      <ul>
        <li>Títulos conseguidos</li>
        <li>Premios individuales</li>
        <li>Selecciones nacionales</li>
        <li>Records personales</li>
      </ul>
      
      <h3>4. Formación</h3>
      <ul>
        <li>Estudios académicos</li>
        <li>Cursos de entrenador</li>
        <li>Idiomas</li>
        <li>Habilidades adicionales</li>
      </ul>
      
      <h2>Consejos de Diseño</h2>
      <ul>
        <li>Usa un diseño limpio y profesional</li>
        <li>Máximo 2 páginas</li>
        <li>Incluye colores corporativos discretos</li>
        <li>Usa gráficos para mostrar estadísticas</li>
        <li>Asegúrate de que sea fácil de leer</li>
      </ul>
      
      <h2>Errores Comunes a Evitar</h2>
      <ul>
        <li>Información desactualizada</li>
        <li>Errores ortográficos</li>
        <li>Exceso de información irrelevante</li>
        <li>Fotos poco profesionales</li>
        <li>Formato difícil de leer</li>
      </ul>
      
      <p><strong>¡Descarga nuestra plantilla gratuita!</strong> Hemos preparado una plantilla en formato Word que puedes personalizar con tu información.</p>
    `,
    excerpt: "Descarga nuestra plantilla gratuita y aprende a estructurar tu experiencia deportiva para impresionar a los reclutadores.",
    category: "Recursos",
    readTime: "5 min",
    author: "Ana García",
    date: "2024-09-28",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800",
    featured: false
  }
]

interface PageProps {
  params: {
    id: string
  }
}

export default function ResourceDetailPage({ params }: PageProps) {
  const article = mockArticles.find(a => a.id === params.id)
  
  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/recursos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a recursos
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mb-8">
          <img 
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            {article.featured && (
              <Badge className="bg-workhoops-accent text-white">Destacado</Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {article.excerpt}
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {article.author}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(article.date).toLocaleDateString('es-ES')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {article.readTime} de lectura
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Call to Action */}
        <div className="bg-workhoops-accent rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Te ha resultado útil este artículo?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Explora más recursos y oportunidades en WorkHoops
          </p>
          <div className="space-x-4">
            <Link href="/recursos">
              <Button variant="secondary" size="lg">
                Más recursos
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-workhoops-accent">
                Ver oportunidades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}