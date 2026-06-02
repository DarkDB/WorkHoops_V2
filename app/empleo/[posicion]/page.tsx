import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, MapPin, Star, ArrowRight, CheckCircle, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'

interface PosicionData {
  nombre: string
  nombreFormal: string
  slug: string
  descripcion: string
  perfil: string
  habilidades: string[]
  salarioRango: string
  mercadoLaboral: string
  tiposOportunidades: string[]
  exemplos: {
    title: string
    club: string
    ciudad: string
    nivel: string
    salario?: string
  }[]
  relacionadas: string[]
}

const POSICIONES: Record<string, PosicionData> = {
  base: {
    nombre: 'Base',
    nombreFormal: 'base',
    slug: 'base',
    descripcion:
      'El base es el director de juego del equipo. Es la posición más demandante en términos de liderazgo y visión táctica.',
    perfil:
      'Los clubes buscan bases que combinen visión de juego, capacidad anotadora y liderazgo. La posición ha evolucionado hacia el "point forward" moderno, valorándose jugadores con versatilidad ofensiva y alta inteligencia baloncestística.',
    habilidades: [
      'Visión de juego y asistencias',
      'Manejo de balón bajo presión',
      'Tiro exterior (3 puntos)',
      'Penetración y finalización',
      'Liderazgo y comunicación',
      'Lectura defensiva del equipo',
    ],
    salarioRango: '800€ - 8.000€/mes según nivel',
    mercadoLaboral:
      'Los bases son los jugadores más solicitados en todas las ligas. Hay demanda tanto en equipos ACB y LEB como en ligas semiprofesionales y formativas. Los bases con experiencia en dirección de juego internacional tienen especial valor.',
    tiposOportunidades: ['Contratos profesionales ACB/LEB', 'Ligas semiprofesionales', 'Programas de cantera', 'Ligas universitarias', 'Academias y campus'],
    exemplos: [
      {
        title: 'Base titular para equipo LEB Oro',
        club: 'Club Baloncesto Murcia',
        ciudad: 'Murcia',
        nivel: 'Profesional',
        salario: '3.000 - 5.000€/mes',
      },
      {
        title: 'Base sub-23 para cantera ACB',
        club: 'Sección de formación',
        ciudad: 'Madrid',
        nivel: 'Cantera',
        salario: '1.200 - 2.000€/mes',
      },
      {
        title: 'Director de juego equipo nacional',
        club: 'Liga Nacional Amateur',
        ciudad: 'Barcelona',
        nivel: 'Amateur',
      },
    ],
    relacionadas: ['escolta', 'entrenador'],
  },
  escolta: {
    nombre: 'Escolta',
    nombreFormal: 'escolta',
    slug: 'escolta',
    descripcion:
      'El escolta es el principal tirador y anotador del perímetro. Una posición con alta demanda en el baloncesto moderno.',
    perfil:
      'Los equipos necesitan escoltas con capacidad anotadora tanto desde el perímetro como en penetración. El escolta moderno debe poder jugar con o sin balón, con un tiro exterior fiable y capacidad de crear desde el bote.',
    habilidades: [
      'Tiro exterior (2 y 3 puntos)',
      'Juego sin balón y cortes',
      'Penetración y finalización',
      'Defensa individual intensa',
      'Rebote ofensivo',
      'Habilidad en pick and roll',
    ],
    salarioRango: '700€ - 7.500€/mes según nivel',
    mercadoLaboral:
      'Los escoltas con tiro exterior fiable son extremadamente cotizados. Hay demanda en todas las categorías, especialmente en ligas donde el juego perimetral es dominante. Los escoltas europeos tienen buena proyección en mercados internacionales.',
    tiposOportunidades: ['Contratos profesionales', 'Ligas semiprofesionales europeas', 'Ligas de verano', 'Programas universitarios', 'Contratos internacionales'],
    exemplos: [
      {
        title: 'Escolta anotador para LEB Plata',
        club: 'Club privado',
        ciudad: 'Valencia',
        nivel: 'Semi-profesional',
        salario: '1.500 - 3.000€/mes',
      },
      {
        title: 'Shooting Guard para equipo EBA',
        club: 'Club Liga EBA',
        ciudad: 'Zaragoza',
        nivel: 'Amateur',
      },
      {
        title: 'Escolta sub-18 formación de élite',
        club: 'Academia privada',
        ciudad: 'Sevilla',
        nivel: 'Cantera',
      },
    ],
    relacionadas: ['base', 'alero'],
  },
  alero: {
    nombre: 'Alero',
    nombreFormal: 'alero',
    slug: 'alero',
    descripcion:
      'El alero es la posición más versátil del baloncesto moderno. Combina capacidades de perímetro con juego interior.',
    perfil:
      'Los aleros modernos necesitan poder jugar en múltiples posiciones. Se valora la versatilidad para defender desde el base hasta el ala-pívot, capacidad anotadora desde cualquier zona y habilidades físicas por encima de la media.',
    habilidades: [
      'Versatilidad defensiva (1-4)',
      'Tiro exterior y media distancia',
      'Rebote en ambos tableros',
      'Juego de poste medio',
      'Atletismo y físico',
      'Lectura ofensiva en movimiento',
    ],
    salarioRango: '900€ - 9.000€/mes según nivel',
    mercadoLaboral:
      'Los aleros versátiles son los jugadores más valiosos en el mercado actual. La posición permite adaptarse a múltiples sistemas, lo que aumenta la demanda en todas las ligas. Los aleros con tiro exterior y capacidad defensiva tienen mayor retribución.',
    tiposOportunidades: ['ACB y EuroLeague', 'Ligas europeas de primer nivel', 'Ligas semiprofesionales', 'Selecciones nacionales', 'Contratos internacionales'],
    exemplos: [
      {
        title: 'Alero versátil para equipo ACB',
        club: 'Club ACB',
        ciudad: 'Madrid',
        nivel: 'Profesional',
        salario: '4.000 - 9.000€/mes',
      },
      {
        title: 'Small Forward liga portuguesa',
        club: 'Clube português',
        ciudad: 'Lisboa / Portugal',
        nivel: 'Semi-profesional',
        salario: '2.000 - 4.000€/mes',
      },
      {
        title: 'Alero juvenil programa FEB',
        club: 'Programa federativo',
        ciudad: 'Nacional',
        nivel: 'Cantera',
      },
    ],
    relacionadas: ['escolta', 'pivot'],
  },
  pivot: {
    nombre: 'Pívot',
    nombreFormal: 'pívot',
    slug: 'pivot',
    descripcion:
      'El pívot es el jugador dominante en la pintura. La posición evoluciona hacia interiores con mayor movilidad y tiro exterior.',
    perfil:
      'El pívot moderno debe combinar la presencia física tradicional con habilidades perimetrales. Se buscan jugadores que puedan proteger el aro, capturar rebotes y también espaciar el campo con amenaza de tiro exterior.',
    habilidades: [
      'Dominio del poste bajo',
      'Rebote ofensivo y defensivo',
      'Bloqueos y tapones',
      'Tiro de media distancia',
      'Tiro exterior (valorado)',
      'Pase desde el poste',
    ],
    salarioRango: '1.000€ - 10.000€/mes según nivel',
    mercadoLaboral:
      'Los pívots de calidad son escasos y muy cotizados en todos los niveles. Los pívots europeos con capacidad de tiro tienen acceso al mercado NBA y a las mejores ligas europeas. En ligas semiprofesionales, la demanda supera la oferta de calidad.',
    tiposOportunidades: ['Contratos en ligas top europeas', 'NBA y G-League', 'Ligas nacionales de primer nivel', 'Contratos internacionales Asia/Australia', 'Ligas semiprofesionales'],
    exemplos: [
      {
        title: 'Pívot dominante para LEB Oro',
        club: 'Club LEB Oro',
        ciudad: 'Bilbao',
        nivel: 'Profesional',
        salario: '3.500 - 7.000€/mes',
      },
      {
        title: 'Center para liga griega',
        club: 'Club Grecia',
        ciudad: 'Atenas / Grecia',
        nivel: 'Semi-profesional',
        salario: '2.500 - 5.000€/mes',
      },
      {
        title: 'Pívot formativo sub-20',
        club: 'Cantera club profesional',
        ciudad: 'Barcelona',
        nivel: 'Cantera',
      },
    ],
    relacionadas: ['alero', 'entrenador'],
  },
  entrenador: {
    nombre: 'Entrenador',
    nombreFormal: 'entrenador/a',
    slug: 'entrenador',
    descripcion:
      'Los entrenadores de baloncesto tienen oportunidades en todos los niveles, desde la formación base hasta el alto rendimiento profesional.',
    perfil:
      'El mercado busca entrenadores con titulación oficial FEB/FIBA, experiencia demostrable y capacidad de desarrollo de jugadores. La especialización en análisis de vídeo, preparación física aplicada al baloncesto o desarrollo de cantera aumenta significativamente el valor en el mercado.',
    habilidades: [
      'Titulación FEB (Nivel 1/2/Superior) o FIBA',
      'Diseño y dirección de entrenamientos',
      'Táctica ofensiva y defensiva',
      'Gestión de equipo y comunicación',
      'Análisis de vídeo y scouting',
      'Desarrollo de jugadores jóvenes',
    ],
    salarioRango: '600€ - 15.000€/mes según nivel y categoría',
    mercadoLaboral:
      'Existe una demanda constante de entrenadores en todos los niveles, especialmente en categorías formativas y semiprofesionales. Los entrenadores con titulación superior y experiencia en sistemas de juego modernos tienen acceso a contratos en ligas europeas de primer nivel.',
    tiposOportunidades: ['Head coach equipos profesionales', 'Asistente técnico ACB/EuroLeague', 'Director técnico de cantera', 'Coordinador de formación', 'Entrenador academia o campus'],
    exemplos: [
      {
        title: 'Primer entrenador equipo LEB Plata',
        club: 'Club LEB Plata',
        ciudad: 'Valencia',
        nivel: 'Semi-profesional',
        salario: '2.000 - 5.000€/mes',
      },
      {
        title: 'Asistente técnico ACB',
        club: 'Club ACB',
        ciudad: 'Madrid',
        nivel: 'Profesional',
        salario: '3.000 - 8.000€/mes',
      },
      {
        title: 'Director cantera juvenil',
        club: 'Club con secciones',
        ciudad: 'Múltiple',
        nivel: 'Formación',
        salario: '1.200 - 2.500€/mes',
      },
    ],
    relacionadas: ['base', 'pivot'],
  },
}

export async function generateStaticParams() {
  return Object.keys(POSICIONES).map((posicion) => ({ posicion }))
}

export async function generateMetadata({
  params,
}: {
  params: { posicion: string }
}): Promise<Metadata> {
  const data = POSICIONES[params.posicion]

  if (!data) {
    return {
      title: 'Posición no encontrada | WorkHoops',
    }
  }

  const title = `Ofertas para ${data.nombreFormal} de Baloncesto | WorkHoops`
  const description = `Trabaja como ${data.nombreFormal} de baloncesto. Encuentra ofertas de empleo para ${data.nombre} en clubes profesionales, semiprofesionales y de formación en España y Latinoamérica.`
  const canonicalUrl = `${process.env.APP_URL || 'https://workhoops.es'}/empleo/${params.posicion}`

  return {
    title,
    description,
    keywords: `empleo ${data.nombreFormal} baloncesto, trabajo ${data.nombre} baloncesto, ofertas ${data.nombre} baloncesto España, ${data.nombre} profesional baloncesto`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'WorkHoops',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function EmpleoPosicionPage({ params }: { params: { posicion: string } }) {
  const data = POSICIONES[params.posicion]

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Posición no encontrada</h1>
          <p className="text-gray-600 mb-8">No tenemos información sobre esta posición todavía.</p>
          <Link href="/oportunidades">
            <Button>Ver todas las oportunidades</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Inicio</Link>
            <span>/</span>
            <Link href="/oportunidades" className="hover:text-gray-700">Oportunidades</Link>
            <span>/</span>
            <span>Empleo para {data.nombre}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trabaja como {data.nombreFormal} de baloncesto
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {data.descripcion}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Badge className="bg-green-100 text-green-800 text-sm py-1 px-3">
              {data.salarioRango}
            </Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {data.tiposOportunidades.length} tipos de oportunidades
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Perfil */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Qué buscan los clubes en un {data.nombre}
              </h2>
              <p className="text-gray-600 leading-relaxed">{data.perfil}</p>
            </section>

            {/* Habilidades */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Habilidades más valoradas
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.habilidades.map((skill) => (
                  <div key={skill} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Star className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tipos de oportunidades */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tipos de oportunidades para {data.nombre}
              </h2>
              <ul className="space-y-2">
                {data.tiposOportunidades.map((tipo) => (
                  <li key={tipo} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {tipo}
                  </li>
                ))}
              </ul>
            </section>

            {/* Ejemplos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ofertas típicas para {data.nombre}
              </h2>
              <div className="space-y-4">
                {data.exemplos.map((ex, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg">{ex.title}</CardTitle>
                        <Badge variant="outline">{ex.nivel}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {ex.club}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ex.ciudad}
                        </span>
                      </div>
                    </CardHeader>
                    {ex.salario && (
                      <CardContent>
                        <p className="text-sm font-medium text-green-700">
                          Retribución estimada: {ex.salario}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link href="/oportunidades?type=empleo">
                  <Button variant="outline" className="gap-2">
                    Ver ofertas reales en WorkHoops
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Mercado */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mercado laboral para {data.nombre}
              </h2>
              <p className="text-gray-600 leading-relaxed">{data.mercadoLaboral}</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">
                  ¿Juegas de {data.nombre}?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-orange-700">
                  Crea tu perfil en WorkHoops y hazte visible para cientos de clubes
                  que buscan {data.nombreFormal} ahora mismo.
                </p>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Perfil con stats y vídeos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Visible para scouts y clubes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Notificaciones de ofertas
                  </li>
                </ul>
                <Link href="/registro">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Crear perfil gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Explorar otras posiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.relacionadas.map((pos) => (
                    <Link key={pos} href={`/empleo/${pos}`} className="block">
                      <Button variant="ghost" className="w-full justify-start capitalize text-sm">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {POSICIONES[pos]?.nombre || pos}
                      </Button>
                    </Link>
                  ))}
                  {Object.keys(POSICIONES)
                    .filter((p) => p !== params.posicion && !data.relacionadas.includes(p))
                    .map((pos) => (
                      <Link key={pos} href={`/empleo/${pos}`} className="block">
                        <Button variant="ghost" className="w-full justify-start capitalize text-sm">
                          <ArrowRight className="w-3 h-3 mr-2" />
                          {POSICIONES[pos]?.nombre || pos}
                        </Button>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Por país
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { slug: 'espana', nombre: 'España' },
                    { slug: 'mexico', nombre: 'México' },
                    { slug: 'argentina', nombre: 'Argentina' },
                    { slug: 'colombia', nombre: 'Colombia' },
                  ].map((pais) => (
                    <Link key={pais.slug} href={`/empleo/baloncesto/${pais.slug}`} className="block">
                      <Button variant="ghost" className="w-full justify-start text-sm">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        Baloncesto en {pais.nombre}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Encuentra tu próximo equipo como {data.nombreFormal}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            WorkHoops es la plataforma de referencia para jugadores de baloncesto hispanohablantes.
            Regístrate gratis y accede a ofertas de clubs de España, México, Argentina y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Crear mi perfil
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Ver ofertas activas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
