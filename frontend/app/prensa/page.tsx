import Link from 'next/link'
import { Download, ExternalLink, Calendar, Users, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'

const pressReleases = [
  {
    date: '2024-09-15',
    title: 'WorkHoops alcanza los 2.500 usuarios registrados en España',
    excerpt: 'La plataforma de oportunidades deportivas duplica su base de usuarios en el último trimestre.',
    category: 'Crecimiento'
  },
  {
    date: '2024-08-20',
    title: 'Nueva funcionalidad de verificación para organizaciones',
    excerpt: 'WorkHoops lanza sistema de verificación para aumentar la confianza entre clubes y jugadores.',
    category: 'Producto'
  },
  {
    date: '2024-07-10',
    title: 'Partnership con la Federación Catalana de Baloncesto',
    excerpt: 'Acuerdo estratégico para promover oportunidades en el baloncesto catalán.',
    category: 'Partnership'
  }
]

const stats = [
  { number: '2,500+', label: 'Usuarios registrados', icon: <Users className="w-6 h-6" /> },
  { number: '150+', label: 'Clubes verificados', icon: <Award className="w-6 h-6" /> },
  { number: '500+', label: 'Oportunidades publicadas', icon: <TrendingUp className="w-6 h-6" /> },
  { number: '95%', label: 'Satisfacción de usuarios', icon: <Award className="w-6 h-6" /> }
]

const mediaKit = [
  {
    title: 'Logos oficiales',
    description: 'Logotipo en diferentes formatos y variaciones',
    files: [
      { name: 'Logo principal (PNG)', size: '2.3 MB' },
      { name: 'Logo horizontal (SVG)', size: '845 KB' },
      { name: 'Logotipo monocromático', size: '1.8 MB' }
    ]
  },
  {
    title: 'Imágenes corporativas',
    description: 'Fotografías oficiales del equipo y producto',
    files: [
      { name: 'Equipo WorkHoops 2024', size: '4.2 MB' },
      { name: 'Screenshots de la app', size: '3.1 MB' },
      { name: 'Imagen corporativa', size: '2.8 MB' }
    ]
  },
  {
    title: 'Documentos corporativos',
    description: 'Información oficial y datos de la empresa',
    files: [
      { name: 'Dossier de prensa', size: '1.2 MB' },
      { name: 'Datos y estadísticas', size: '890 KB' },
      { name: 'Biografías del equipo', size: '650 KB' }
    ]
  }
]

export default function PrensaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                Sala de{' '}
                <span className="text-workhoops-accent">Prensa</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Recursos, noticias y materiales para periodistas y medios de comunicación 
                interesados en WorkHoops y el futuro del baloncesto español.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4">
                <Download className="w-5 h-5 mr-2" />
                Descargar kit de prensa
              </Button>
              
              <Button size="lg" variant="outline" className="px-8 py-4">
                <Calendar className="w-5 h-5 mr-2" />
                Solicitar entrevista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              WorkHoops en cifras
            </h2>
            <p className="text-lg text-gray-600">
              Datos actualizados a octubre de 2024
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-workhoops-accent">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-black text-workhoops-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comunicados de prensa
            </h2>
            <p className="text-lg text-gray-600">
              Las últimas novedades y anuncios oficiales de WorkHoops
            </p>
          </div>

          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="outline" className="text-workhoops-accent border-workhoops-accent">
                          {release.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(release.date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {release.title}
                      </h3>
                      
                      <p className="text-gray-600">
                        {release.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Leer más
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kit de medios
            </h2>
            <p className="text-lg text-gray-600">
              Logotipos, imágenes y recursos oficiales para usar en tus publicaciones
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {mediaKit.map((kit, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{kit.title}</CardTitle>
                  <CardDescription>{kit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kit.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Descargar todo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sobre WorkHoops
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>WorkHoops</strong> es la plataforma líder en España que conecta 
                  profesionales del baloncesto con oportunidades reales de empleo, pruebas, 
                  torneos, becas y patrocinios.
                </p>
                <p>
                  Fundada en 2024 en Barcelona, nuestra misión es democratizar el acceso 
                  a oportunidades en el baloncesto español, eliminando las barreras 
                  tradicionales que dificultan la conexión entre talento y organizaciones.
                </p>
                <p>
                  Con más de 2,500 usuarios registrados y 150 clubes verificados, WorkHoops 
                  se ha convertido en el referente del sector para jugadores, entrenadores, 
                  clubes y marcas que buscan crecer en el ecosistema del baloncesto.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contacto de prensa
              </h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border">
                  <h4 className="font-semibold text-gray-900 mb-2">Departamento de Comunicación</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> prensa@workhoops.es</p>
                    <p><strong>Teléfono:</strong> +34 600 000 000</p>
                    <p><strong>Horario:</strong> L-V 9:00-18:00 CET</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border">
                  <h4 className="font-semibold text-gray-900 mb-2">CEO y Fundador</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Carlos Martínez</strong></p>
                    <p>Disponible para entrevistas</p>
                    <p>Email: carlos@workhoops.es</p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Nota para editores</h4>
                  <p className="text-sm text-orange-700">
                    Todas las imágenes y logotipos están libres de derechos para uso editorial. 
                    Se requiere atribución a WorkHoops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Quieres saber más sobre WorkHoops?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Estamos disponibles para entrevistas, colaboraciones y partnership
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4">
              <Calendar className="w-5 h-5 mr-2" />
              Solicitar entrevista
            </Button>
            <Link href="mailto:prensa@workhoops.es">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-workhoops-accent px-8 py-4">
                Contactar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}