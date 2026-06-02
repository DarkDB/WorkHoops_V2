import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Briefcase, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'

interface PaisData {
  nombre: string
  nombreEn: string
  slug: string
  descripcion: string
  mercado: string
  ligas: string[]
  ciudades: string[]
  oportunidades: {
    title: string
    tipo: string
    ciudad: string
    nivel: string
    descripcion: string
  }[]
}

const PAISES: Record<string, PaisData> = {
  espana: {
    nombre: 'España',
    nombreEn: 'Spain',
    slug: 'espana',
    descripcion:
      'España es uno de los mercados de baloncesto más desarrollados de Europa, con una rica historia competitiva y una infraestructura profesional sólida.',
    mercado:
      'El baloncesto español cuenta con la ACB como principal liga profesional, además de múltiples ligas autonómicas y categorías de formación. El país exporta talento a la NBA y a ligas europeas, lo que genera constantemente nuevas oportunidades tanto para jugadores como para entrenadores y staff técnico.',
    ligas: ['ACB (Liga Endesa)', 'LEB Oro', 'LEB Plata', 'Liga EBA', 'Primera Nacional'],
    ciudades: ['Madrid', 'Barcelona', 'Valencia', 'Málaga', 'Bilbao', 'Sevilla', 'Zaragoza'],
    oportunidades: [
      {
        title: 'Base profesional para club ACB',
        tipo: 'Contrato profesional',
        ciudad: 'Madrid',
        nivel: 'Profesional',
        descripcion: 'Club de primera división busca base con experiencia en ligas de alto nivel.',
      },
      {
        title: 'Entrenador asistente LEB Oro',
        tipo: 'Empleo técnico',
        ciudad: 'Barcelona',
        nivel: 'Semi-profesional',
        descripcion: 'Se busca entrenador asistente con titulación FEB nivel 2 o superior.',
      },
      {
        title: 'Preparador físico cantera',
        tipo: 'Empleo staff',
        ciudad: 'Valencia',
        nivel: 'Formación',
        descripcion: 'Club formativo busca preparador físico para categorías inferiores.',
      },
    ],
  },
  mexico: {
    nombre: 'México',
    nombreEn: 'Mexico',
    slug: 'mexico',
    descripcion:
      'México tiene un mercado de baloncesto en crecimiento, con la LNBP como principal referente y una creciente comunidad de jugadores hispanohablantes.',
    mercado:
      'La Liga Nacional de Baloncesto Profesional (LNBP) es el eje del baloncesto mexicano. Además, la influencia de la NBA en el país ha impulsado el desarrollo de academias y programas de formación, creando oportunidades para entrenadores, jugadores y especialistas deportivos.',
    ligas: ['LNBP (Liga Nacional de Baloncesto Profesional)', 'CIBACOPA', 'Liga de Baloncesto Estudiantil'],
    ciudades: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'],
    oportunidades: [
      {
        title: 'Alero para equipo LNBP',
        tipo: 'Contrato profesional',
        ciudad: 'Ciudad de México',
        nivel: 'Profesional',
        descripcion: 'Franquicia LNBP busca alero con experiencia en ligas latinoamericanas.',
      },
      {
        title: 'Director técnico academia juvenil',
        tipo: 'Empleo técnico',
        ciudad: 'Guadalajara',
        nivel: 'Formación',
        descripcion: 'Academia privada busca director con experiencia en desarrollo de talentos.',
      },
      {
        title: 'Coordinador de scouting',
        tipo: 'Empleo staff',
        ciudad: 'Monterrey',
        nivel: 'Semi-profesional',
        descripcion: 'Club semiprofesional busca coordinador de scouting para expansión de plantilla.',
      },
    ],
  },
  argentina: {
    nombre: 'Argentina',
    nombreEn: 'Argentina',
    slug: 'argentina',
    descripcion:
      'Argentina es una potencia histórica del baloncesto sudamericano, con una tradición medallística olímpica y una cantera constante de talento internacional.',
    mercado:
      'La Liga Nacional de Básquet (LNB) es la competición de referencia. Argentina ha sido históricamente un exportador neto de talento hacia Europa y América del Norte, lo que genera un ecosistema vibrante de oportunidades para jugadores y profesionales del sector.',
    ligas: ['Liga Nacional de Básquet (LNB)', 'TNA (Torneo Nacional de Ascenso)', 'Liga Metropolitana'],
    ciudades: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
    oportunidades: [
      {
        title: 'Pívot para club LNB',
        tipo: 'Contrato profesional',
        ciudad: 'Buenos Aires',
        nivel: 'Profesional',
        descripcion: 'Club de primera división busca pívot dominante en el juego interior.',
      },
      {
        title: 'Entrenador primer equipo TNA',
        tipo: 'Empleo técnico',
        ciudad: 'Córdoba',
        nivel: 'Semi-profesional',
        descripcion: 'Club ascendente busca entrenador con experiencia en competiciones nacionales.',
      },
      {
        title: 'Analista de vídeo y rendimiento',
        tipo: 'Empleo staff',
        ciudad: 'Rosario',
        nivel: 'Semi-profesional',
        descripcion: 'Equipo profesional busca analista con dominio de herramientas de video análisis.',
      },
    ],
  },
  colombia: {
    nombre: 'Colombia',
    nombreEn: 'Colombia',
    slug: 'colombia',
    descripcion:
      'Colombia tiene una escena de baloncesto en desarrollo, con la Liga Profesional de Baloncesto como plataforma principal y creciente presencia en competiciones FIBA Americas.',
    mercado:
      'La Liga Profesional de Baloncesto de Colombia impulsa el desarrollo del deporte en el país. La selección nacional ha mostrado mejoras constantes en FIBA Americas, generando oportunidades para jugadores con experiencia internacional y formadores de alto nivel.',
    ligas: ['Liga Profesional de Baloncesto', 'Liga Estudiantil de Baloncesto', 'Campeonatos Departamentales'],
    ciudades: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'],
    oportunidades: [
      {
        title: 'Escolta para equipo profesional',
        tipo: 'Contrato profesional',
        ciudad: 'Bogotá',
        nivel: 'Profesional',
        descripcion: 'Club de la Liga Profesional busca escolta con visión anotadora.',
      },
      {
        title: 'Entrenador de formación',
        tipo: 'Empleo técnico',
        ciudad: 'Medellín',
        nivel: 'Formación',
        descripcion: 'Programa municipal de básquet busca entrenador para categorías base.',
      },
      {
        title: 'Fisioterapeuta deportivo',
        tipo: 'Empleo staff',
        ciudad: 'Cali',
        nivel: 'Semi-profesional',
        descripcion: 'Club semiprofesional busca fisioterapeuta con experiencia en baloncesto.',
      },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(PAISES).map((pais) => ({ pais }))
}

export async function generateMetadata({
  params,
}: {
  params: { pais: string }
}): Promise<Metadata> {
  const data = PAISES[params.pais]

  if (!data) {
    return {
      title: 'País no encontrado | WorkHoops',
    }
  }

  const title = `Empleo Baloncesto ${data.nombre} | WorkHoops`
  const description = `Encuentra ofertas de empleo en baloncesto en ${data.nombre}. Jugadores, entrenadores, staff técnico y más. Conecta con los mejores clubes y organizaciones.`
  const canonicalUrl = `${process.env.APP_URL || 'https://workhoops.es'}/empleo/baloncesto/${params.pais}`

  return {
    title,
    description,
    keywords: `empleo baloncesto ${data.nombre}, trabajo baloncesto ${data.nombre}, ofertas baloncesto ${data.nombre}, jugador baloncesto ${data.nombre}, entrenador baloncesto ${data.nombre}`,
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

export default function EmpleoBaloncestoPaisPage({ params }: { params: { pais: string } }) {
  const data = PAISES[params.pais]

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">País no encontrado</h1>
          <p className="text-gray-600 mb-8">No tenemos información sobre empleo de baloncesto en este país todavía.</p>
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
            <span>Baloncesto en {data.nombre}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ofertas de empleo en baloncesto en {data.nombre}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {data.descripcion}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Intro */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                El mercado de baloncesto en {data.nombre}
              </h2>
              <p className="text-gray-600 leading-relaxed">{data.mercado}</p>
            </section>

            {/* Ligas */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Principales ligas y competiciones
              </h2>
              <ul className="space-y-2">
                {data.ligas.map((liga) => (
                  <li key={liga} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {liga}
                  </li>
                ))}
              </ul>
            </section>

            {/* Sample opportunities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tipos de oportunidades destacadas en {data.nombre}
              </h2>
              <div className="space-y-4">
                {data.oportunidades.map((op, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg">{op.title}</CardTitle>
                        <Badge variant="outline">{op.nivel}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {op.ciudad}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {op.tipo}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{op.descripcion}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link href={`/oportunidades?type=empleo`}>
                  <Button variant="outline" className="gap-2">
                    Ver todas las ofertas en WorkHoops
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* Ciudades */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ciudades con mayor actividad en {data.nombre}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.ciudades.map((ciudad) => (
                  <Badge key={ciudad} variant="secondary" className="text-sm py-1 px-3">
                    <MapPin className="w-3 h-3 mr-1" />
                    {ciudad}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">
                  ¿Buscas trabajo en el baloncesto?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-orange-700">
                  Crea tu perfil gratuito en WorkHoops y accede a cientos de oportunidades
                  en {data.nombre} y toda Latinoamérica.
                </p>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Perfil visible para clubes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Aplica con un clic
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    Alertas de nuevas ofertas
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
                <CardTitle className="text-lg">¿Eres un club o agencia?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Publica tus ofertas y llega a miles de jugadores y entrenadores en {data.nombre}.
                </p>
                <Link href="/publicar">
                  <Button variant="outline" className="w-full">
                    Publicar una oferta
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Explorar por posición
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['base', 'escolta', 'alero', 'pivot', 'entrenador'].map((pos) => (
                    <Link key={pos} href={`/empleo/${pos}`} className="block">
                      <Button variant="ghost" className="w-full justify-start capitalize text-sm">
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {pos === 'pivot' ? 'Pívot' : pos.charAt(0).toUpperCase() + pos.slice(1)}
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
            La plataforma de empleo de baloncesto en {data.nombre}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            WorkHoops conecta a jugadores, entrenadores y staff técnico con los mejores clubes
            y organizaciones de baloncesto en {data.nombre} y toda la comunidad hispanohablante.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Registrarse gratis
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Ver oportunidades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
