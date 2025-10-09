import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-workhoops-accent" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Términos de Uso
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Última actualización: 7 de octubre de 2024
          </p>
        </div>

        {/* Aviso importante */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">Aviso Importante</h3>
              <p className="text-orange-700">
                <strong>WorkHoops actúa como intermediario de difusión.</strong> Verificamos ofertas a nivel razonable 
                mediante revisión manual, pero el organizador es el responsable final de su contenido, veracidad 
                y cumplimiento de la legislación laboral y deportiva aplicable.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Aceptación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-workhoops-accent" />
                <span>1. Aceptación de los Términos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Al acceder y utilizar WorkHoops, aceptas estar legalmente vinculado por estos términos de uso. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
              </p>
              <div className="bg-gray-50 border-l-4 border-workhoops-accent p-4">
                <p className="text-sm">
                  <strong>Entidad responsable:</strong> WorkHoops SL, sociedad española con CIF B12345678, 
                  con domicilio en Calle Ejemplo 123, 08001 Barcelona, España.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Definiciones */}
          <Card>
            <CardHeader>
              <CardTitle>2. Definiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>"Plataforma":</strong> <span className="text-gray-600">La web WorkHoops y todos sus servicios asociados.</span>
              </div>
              <div>
                <strong>"Usuario":</strong> <span className="text-gray-600">Cualquier persona que accede o usa la plataforma.</span>
              </div>
              <div>
                <strong>"Talento":</strong> <span className="text-gray-600">Jugadores, entrenadores y otros profesionales del baloncesto.</span>
              </div>
              <div>
                <strong>"Organizador":</strong> <span className="text-gray-600">Clubes, empresas o entidades que publican oportunidades.</span>
              </div>
              <div>
                <strong>"Oportunidad":</strong> <span className="text-gray-600">Empleos, pruebas, torneos, becas y otros servicios publicados.</span>
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          <Card>
            <CardHeader>
              <CardTitle>3. Descripción de los Servicios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                WorkHoops es una plataforma digital que conecta profesionales del baloncesto con oportunidades. 
                Nuestros servicios incluyen:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Publicación y búsqueda de oportunidades deportivas</li>
                <li>• Creación de perfiles profesionales para talentos</li>
                <li>• Sistema de aplicaciones a oportunidades</li>
                <li>• Herramientas de comunicación entre usuarios</li>
                <li>• Recursos educativos y guías especializadas</li>
                <li>• Servicios de verificación de perfiles y organizaciones</li>
              </ul>
            </CardContent>
          </Card>

          {/* Registro y cuentas */}
          <Card>
            <CardHeader>
              <CardTitle>4. Registro y Cuentas de Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Requisitos de registro:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Ser mayor de 16 años (menores necesitan consentimiento parental)</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Mantener la confidencialidad de tus credenciales</li>
                  <li>Una sola cuenta por persona</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 Responsabilidades del usuario:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Eres responsable de toda la actividad en tu cuenta</li>
                  <li>Debes notificar inmediatamente cualquier uso no autorizado</li>
                  <li>Mantener tu información de perfil actualizada</li>
                  <li>No compartir tu cuenta con terceros</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Uso aceptable */}
          <Card>
            <CardHeader>
              <CardTitle>5. Política de Uso Aceptable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Usos permitidos:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Buscar y aplicar a oportunidades legítimas</li>
                  <li>Publicar ofertas veraces y legales</li>
                  <li>Crear un perfil profesional honesto</li>
                  <li>Comunicarte de forma profesional con otros usuarios</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-700 mb-2">❌ Usos prohibidos:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Publicar información falsa o engañosa</li>
                  <li>Acosar, discriminar o intimidar a otros usuarios</li>
                  <li>Publicar contenido ofensivo, ilegal o inapropiado</li>
                  <li>Intentar acceder sin autorización a cuentas ajenas</li>
                  <li>Usar la plataforma para actividades comerciales no autorizadas</li>
                  <li>Realizar ingeniería inversa o copiar la plataforma</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contenido y propiedad intelectual */}
          <Card>
            <CardHeader>
              <CardTitle>6. Contenido y Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">6.1 Tu contenido:</h4>
                <p className="text-gray-600">
                  Conservas la propiedad de todo el contenido que publiques. Al usar WorkHoops, nos otorgas 
                  una licencia limitada para mostrar y distribuir tu contenido en la plataforma.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6.2 Nuestro contenido:</h4>
                <p className="text-gray-600">
                  WorkHoops, su diseño, funcionalidades y contenido están protegidos por derechos de autor 
                  y otras leyes de propiedad intelectual.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verificación */}
          <Card>
            <CardHeader>
              <CardTitle>7. Proceso de Verificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">7.1 Verificación de ofertas:</h4>
                <p className="text-gray-600">
                  Revisamos manualmente todas las oportunidades publicadas para verificar su legitimidad básica. 
                  Sin embargo, no podemos garantizar la exactitud completa de toda la información.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">7.2 Verificación de perfiles:</h4>
                <p className="text-gray-600">
                  Ofrecemos un proceso de verificación opcional para perfiles y organizaciones mediante 
                  documentación oficial.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Limitación de responsabilidad:</strong> La verificación no constituye una garantía 
                  completa. Los usuarios deben ejercer su propio juicio y realizar su debida diligencia.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pagos */}
          <Card>
            <CardHeader>
              <CardTitle>8. Pagos y Facturación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">8.1 Planes de pago:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Plan Pro: Suscripción mensual o anual</li>
                  <li>Plan Destacado: Pago único por 60 días</li>
                  <li>Los precios incluyen IVA cuando corresponda</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">8.2 Política de reembolsos:</h4>
                <p className="text-gray-600">
                  Puedes cancelar tu suscripción en cualquier momento. Los reembolsos se procesarán 
                  según la legislación española de protección al consumidor.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitación responsabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="w-5 h-5 text-workhoops-accent" />
                <span>9. Limitación de Responsabilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Exclusiones importantes:</h4>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>No somos responsables del contenido publicado por terceros</li>
                  <li>No garantizamos que obtendrás empleo o oportunidades</li>
                  <li>No somos parte en las relaciones laborales que se establezcan</li>
                  <li>Los organizadores son responsables del cumplimiento laboral y legal</li>
                </ul>
              </div>

              <p className="text-gray-600">
                Nuestra responsabilidad se limita al valor de los servicios pagados. En ningún caso 
                seremos responsables de daños indirectos, lucro cesante o daños consecuenciales.
              </p>
            </CardContent>
          </Card>

          {/* Terminación */}
          <Card>
            <CardHeader>
              <CardTitle>10. Terminación del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">10.1 Por tu parte:</h4>
                <p className="text-gray-600">
                  Puedes cerrar tu cuenta en cualquier momento desde la configuración de tu perfil.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">10.2 Por nuestra parte:</h4>
                <p className="text-gray-600">
                  Podemos suspender o terminar tu cuenta si violas estos términos, con o sin previo aviso 
                  según la gravedad de la infracción.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ley aplicable */}
          <Card>
            <CardHeader>
              <CardTitle>11. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Estos términos se rigen por la legislación española. Cualquier disputa será resuelta 
                en los tribunales de Barcelona, España, sin perjuicio de los derechos del consumidor.
              </p>
            </CardContent>
          </Card>

          {/* Modificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>12. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Podemos modificar estos términos ocasionalmente. Te notificaremos los cambios importantes 
                por email o mediante aviso en la plataforma con al menos 30 días de antelación.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>13. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email legal:</strong> legal@workhoops.es</p>
                <p><strong>Email general:</strong> hola@workhoops.es</p>
                <p><strong>Dirección:</strong> Calle Ejemplo 123, 08001 Barcelona, España</p>
                <p><strong>Teléfono:</strong> +34 600 000 000</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}