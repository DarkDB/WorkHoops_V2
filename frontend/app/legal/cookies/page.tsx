import Link from 'next/link'
import { ArrowLeft, Cookie, Settings, BarChart, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'

export default function CookiesPage() {
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
            <Cookie className="w-8 h-8 text-workhoops-accent" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Política de Cookies
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Última actualización: 7 de octubre de 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Qué son las cookies */}
          <Card>
            <CardHeader>
              <CardTitle>1. ¿Qué son las cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo 
                cuando los visitas. Se utilizan ampliamente para hacer que los sitios web funcionen de 
                manera más eficiente, así como para proporcionar información a los propietarios del sitio.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">En WorkHoops utilizamos cookies para:</h4>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Mantener tu sesión iniciada</li>
                  <li>Recordar tus preferencias</li>
                  <li>Mejorar la funcionalidad de la plataforma</li>
                  <li>Analizar el uso del sitio web</li>
                  <li>Personalizar tu experiencia</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tipos de cookies */}
          <Card>
            <CardHeader>
              <CardTitle>2. Tipos de Cookies que Utilizamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Cookies técnicas */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-green-700">Cookies Técnicas (Necesarias)</h4>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Estas cookies son esenciales para el funcionamiento básico del sitio web y no se pueden desactivar.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 font-medium">Cookie</th>
                        <th className="text-left p-2 font-medium">Propósito</th>
                        <th className="text-left p-2 font-medium">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-t">
                        <td className="p-2 font-mono">next-auth.session</td>
                        <td className="p-2">Mantener tu sesión iniciada</td>
                        <td className="p-2">30 días</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">workhoops-preferences</td>
                        <td className="p-2">Recordar configuración básica</td>
                        <td className="p-2">1 año</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">csrf-token</td>
                        <td className="p-2">Protección contra ataques CSRF</td>
                        <td className="p-2">Sesión</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cookies analíticas */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-blue-700">Cookies Analíticas</h4>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 font-medium">Cookie</th>
                        <th className="text-left p-2 font-medium">Proveedor</th>
                        <th className="text-left p-2 font-medium">Propósito</th>
                        <th className="text-left p-2 font-medium">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-t">
                        <td className="p-2 font-mono">_ga</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">Identificar usuarios únicos</td>
                        <td className="p-2">2 años</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">_ga_*</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">Mantener estado de sesión</td>
                        <td className="p-2">2 años</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">_gid</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">Identificar usuarios únicos</td>
                        <td className="p-2">24 horas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cookies de funcionalidad */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold text-purple-700">Cookies de Funcionalidad</h4>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Permiten recordar las elecciones que haces para proporcionarte funciones mejoradas y personales.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 font-medium">Cookie</th>
                        <th className="text-left p-2 font-medium">Propósito</th>
                        <th className="text-left p-2 font-medium">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-t">
                        <td className="p-2 font-mono">workhoops-filters</td>
                        <td className="p-2">Recordar filtros de búsqueda</td>
                        <td className="p-2">30 días</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">workhoops-language</td>
                        <td className="p-2">Preferencia de idioma</td>
                        <td className="p-2">1 año</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-mono">workhoops-theme</td>
                        <td className="p-2">Preferencias de visualización</td>
                        <td className="p-2">6 meses</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Base legal */}
          <Card>
            <CardHeader>
              <CardTitle>3. Base Legal para el Uso de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cookies técnicas:</h4>
                <p className="text-gray-600">
                  Se basan en el interés legítimo para el funcionamiento del sitio web (Art. 6.1.f RGPD).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Cookies analíticas y de funcionalidad:</h4>
                <p className="text-gray-600">
                  Requieren tu consentimiento explícito según la Ley de Servicios de la Sociedad 
                  de la Información (LSSI) española.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Control de cookies */}
          <Card>
            <CardHeader>
              <CardTitle>4. Cómo Gestionar las Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h4 className="font-semibold mb-3">4.1 Panel de preferencias de WorkHoops</h4>
                <p className="text-gray-600 mb-4">
                  Puedes gestionar tus preferencias de cookies en cualquier momento:
                </p>
                <Button className="mb-4" onClick={() => alert('Aquí se abriría el panel de cookies')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Cookies
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-3">4.2 Configuración del navegador</h4>
                <p className="text-gray-600 mb-3">
                  También puedes controlar las cookies a través de la configuración de tu navegador:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Google Chrome</h5>
                    <p className="text-sm text-gray-600">
                      Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Mozilla Firefox</h5>
                    <p className="text-sm text-gray-600">
                      Opciones → Privacidad y seguridad → Cookies y datos del sitio
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Safari</h5>
                    <p className="text-sm text-gray-600">
                      Preferencias → Privacidad → Gestionar datos de sitios web
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Microsoft Edge</h5>
                    <p className="text-sm text-gray-600">
                      Configuración → Privacidad, búsqueda y servicios → Cookies
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Nota importante:</strong> Deshabilitar ciertas cookies puede afectar 
                  la funcionalidad de WorkHoops. Las cookies técnicas no se pueden desactivar 
                  ya que son necesarias para el funcionamiento básico del sitio.
                </p>
              </div>
            </div>
          </Card>

          {/* Cookies de terceros */}
          <Card>
            <CardHeader>
              <CardTitle>5. Cookies de Terceros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Nos ayuda a analizar el tráfico y el comportamiento de los usuarios.
                  </p>
                  <Link 
                    href="https://policies.google.com/privacy"
                    className="text-workhoops-accent text-sm hover:underline"
                    target="_blank"
                  >
                    Política de privacidad de Google →
                  </Link>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Stripe</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Para el procesamiento seguro de pagos.
                  </p>
                  <Link 
                    href="https://stripe.com/privacy"
                    className="text-workhoops-accent text-sm hover:underline"
                    target="_blank"
                  >
                    Política de privacidad de Stripe →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actualizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>6. Actualizaciones de esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Podemos actualizar esta política de cookies ocasionalmente. Te notificaremos 
                cualquier cambio significativo mediante un aviso en nuestro sitio web o por email.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>7. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Si tienes preguntas sobre esta política de cookies:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email:</strong> privacidad@workhoops.es</p>
                <p><strong>Dirección:</strong> Calle Ejemplo 123, 08001 Barcelona, España</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}