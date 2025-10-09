import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'

export default function PrivacidadPage() {
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
            <Shield className="w-8 h-8 text-workhoops-accent" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Última actualización: 7 de octubre de 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Introducción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-workhoops-accent" />
                <span>1. Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                En WorkHoops, respetamos tu privacidad y estamos comprometidos con la protección de tus datos personales. 
                Esta política de privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tu información 
                cuando utilizas nuestra plataforma.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Responsable del tratamiento:</h4>
                <p className="text-orange-700">
                  WorkHoops SL<br/>
                  CIF: B12345678<br/>
                  Dirección: Calle Ejemplo 123, 08001 Barcelona, España<br/>
                  Email: privacidad@workhoops.es
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Datos que recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-workhoops-accent" />
                <span>2. Datos que Recopilamos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 Datos de registro:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Contraseña (encriptada)</li>
                  <li>Rol (jugador, entrenador, club)</li>
                  <li>Ciudad de residencia</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.2 Datos de perfil deportivo (jugadores/entrenadores):</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Información deportiva (posición, altura, experiencia)</li>
                  <li>Enlaces a highlights o redes sociales</li>
                  <li>Fotografía de perfil</li>
                  <li>Historial deportivo y logros</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 Datos de uso:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Dirección IP</li>
                  <li>Información del navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de navegación</li>
                  <li>Interacciones con oportunidades (aplicaciones, favoritos)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Base legal */}
          <Card>
            <CardHeader>
              <CardTitle>3. Base Legal del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Consentimiento (Art. 6.1.a RGPD):</h4>
                <p className="text-gray-600">Para el envío de newsletters, comunicaciones promocionales y alertas personalizadas.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Ejecución de contrato (Art. 6.1.b RGPD):</h4>
                <p className="text-gray-600">Para proporcionar nuestros servicios, gestionar tu cuenta y facilitar conexiones entre usuarios.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Interés legítimo (Art. 6.1.f RGPD):</h4>
                <p className="text-gray-600">Para mejorar nuestros servicios, prevenir fraudes y garantizar la seguridad de la plataforma.</p>
              </div>
            </CardContent>
          </Card>

          {/* Finalidades */}
          <Card>
            <CardHeader>
              <CardTitle>4. Finalidades del Tratamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Gestionar tu cuenta y perfil en la plataforma</li>
                <li>• Facilitar la conexión entre jugadores/entrenadores y clubes</li>
                <li>• Procesar aplicaciones a oportunidades</li>
                <li>• Enviar notificaciones sobre oportunidades relevantes</li>
                <li>• Proporcionar soporte técnico y atención al cliente</li>
                <li>• Mejorar nuestros servicios mediante análisis de uso</li>
                <li>• Cumplir con obligaciones legales</li>
                <li>• Prevenir fraudes y garantizar la seguridad</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartir datos */}
          <Card>
            <CardHeader>
              <CardTitle>5. Compartir Datos con Terceros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>No vendemos tus datos personales a terceros.</strong> Solo compartimos información en las siguientes circunstancias:
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.1 Con tu consentimiento:</h4>
                <p className="text-gray-600">Cuando aplicas a una oportunidad, compartimos tu perfil con el organizador correspondiente.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 Proveedores de servicios:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Supabase (almacenamiento de datos)</li>
                  <li>Resend (envío de emails)</li>
                  <li>Stripe (procesamiento de pagos)</li>
                  <li>Proveedores de análisis web</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.3 Obligación legal:</h4>
                <p className="text-gray-600">Cuando sea requerido por autoridades competentes o para cumplir con la legislación vigente.</p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>6. Tus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Derecho de acceso:</h4>
                <p className="text-gray-600 text-sm">Puedes solicitar información sobre qué datos personales tenemos sobre ti.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Derecho de rectificación:</h4>
                <p className="text-gray-600 text-sm">Puedes solicitar la corrección de datos inexactos o incompletos.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Derecho de supresión ("derecho al olvido"):</h4>
                <p className="text-gray-600 text-sm">Puedes solicitar la eliminación de tus datos personales.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Derecho a la portabilidad:</h4>
                <p className="text-gray-600 text-sm">Puedes solicitar una copia de tus datos en formato estructurado.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Derecho de oposición:</h4>
                <p className="text-gray-600 text-sm">Puedes oponerte al tratamiento de tus datos para fines de marketing directo.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800">
                  <strong>Para ejercer tus derechos:</strong> Envía un email a privacidad@workhoops.es 
                  incluyendo tu nombre completo y una copia de tu documento de identidad.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-workhoops-accent" />
                <span>7. Seguridad de los Datos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Encriptación SSL/TLS para todas las transmisiones</li>
                <li>Contraseñas encriptadas con algoritmos seguros</li>
                <li>Acceso restringido a datos personales por personal autorizado</li>
                <li>Copias de seguridad regulares y seguras</li>
                <li>Monitorización continua de la seguridad</li>
              </ul>
            </CardContent>
          </Card>

          {/* Retención */}
          <Card>
            <CardHeader>
              <CardTitle>8. Período de Retención</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Cuentas activas:</strong> Mientras mantengas tu cuenta activa</li>
                <li>• <strong>Cuentas inactivas:</strong> 3 años desde la última actividad</li>
                <li>• <strong>Datos de facturación:</strong> 6 años (obligación legal)</li>
                <li>• <strong>Cookies y datos de análisis:</strong> Máximo 2 años</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>9. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email:</strong> privacidad@workhoops.es</p>
                <p><strong>Dirección:</strong> Calle Ejemplo 123, 08001 Barcelona, España</p>
                <p><strong>Teléfono:</strong> +34 600 000 000</p>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) 
                si consideras que el tratamiento de tus datos no se ajusta a la normativa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}