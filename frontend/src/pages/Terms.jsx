import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="terms-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Términos de Uso
            </h1>
            <p className="text-gray-600">
              Última actualización: Diciembre 2024
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Contenido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#acceptance" className="block text-sm text-gray-600 hover:text-orange-600">
                  1. Aceptación
                </a>
                <a href="#description" className="block text-sm text-gray-600 hover:text-orange-600">
                  2. Descripción del servicio
                </a>
                <a href="#user-accounts" className="block text-sm text-gray-600 hover:text-orange-600">
                  3. Cuentas de usuario
                </a>
                <a href="#content" className="block text-sm text-gray-600 hover:text-orange-600">
                  4. Contenido
                </a>
                <a href="#prohibited" className="block text-sm text-gray-600 hover:text-orange-600">
                  5. Usos prohibidos
                </a>
                <a href="#payment" className="block text-sm text-gray-600 hover:text-orange-600">
                  6. Pagos y reembolsos
                </a>
                <a href="#liability" className="block text-sm text-gray-600 hover:text-orange-600">
                  7. Responsabilidad
                </a>
                <a href="#termination" className="block text-sm text-gray-600 hover:text-orange-600">
                  8. Terminación
                </a>
                <a href="#governing-law" className="block text-sm text-gray-600 hover:text-orange-600">
                  9. Legislación aplicable
                </a>
                <a href="#contact" className="block text-sm text-gray-600 hover:text-orange-600">
                  10. Contacto
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8 prose prose-gray max-w-none">
                
                <Alert className="mb-8">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Al usar WorkHoops, aceptas estos términos de uso. Si no estás de acuerdo, 
                    por favor no utilices nuestros servicios.
                  </AlertDescription>
                </Alert>

                <section id="acceptance">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Aceptación de los términos</h2>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Estos términos de uso ("Términos") constituyen un acuerdo legal entre tú ("Usuario") 
                    y WorkHoops ("nosotros", "nuestro" o "la Plataforma") que rige el uso de nuestros servicios.
                  </p>
                  <p className="text-gray-700 mb-6">
                    Al acceder o usar WorkHoops, confirmas que has leído, entendido y aceptado 
                    estar sujeto a estos Términos, así como a nuestra Política de Privacidad.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="description">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">2. Descripción del servicio</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    WorkHoops es una plataforma digital que conecta talento del baloncesto con oportunidades 
                    profesionales en España. Nuestros servicios incluyen:
                  </p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>Publicación y búsqueda de ofertas de empleo, pruebas, torneos y becas</li>
                    <li>Creación de perfiles profesionales para jugadores, entrenadores y staff técnico</li>
                    <li>Herramientas de comunicación entre organizaciones y candidatos</li>
                    <li>Servicios de verificación de perfiles y ofertas</li>
                    <li>Recursos educativos y guías para el desarrollo profesional</li>
                  </ul>
                  
                  <div className="bg-orange-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-orange-800">
                      <strong>Importante:</strong> WorkHoops actúa como intermediario facilitando 
                      conexiones. No garantizamos empleo ni somos responsables de las decisiones 
                      de contratación de terceros.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                <section id="user-accounts">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cuentas de usuario</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Registro:</h3>
                  <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                    <li>Debes proporcionar información precisa y actualizada</li>
                    <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                    <li>Debes notificarnos inmediatamente cualquier uso no autorizado</li>
                    <li>Debes ser mayor de 16 años para crear una cuenta</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipos de cuenta:</h3>
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li><strong>Talento:</strong> Gratuita para jugadores, entrenadores y staff</li>
                    <li><strong>Organización:</strong> Planes gratuitos y de pago para clubs y empresas</li>
                    <li><strong>Verificada:</strong> Cuentas que han completado nuestro proceso de verificación</li>
                  </ul>
                </section>

                <Separator className="my-8" />

                <section id="content">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contenido del usuario</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tu contenido:</h3>
                  <p className="text-gray-700 mb-4">
                    Eres el único responsable del contenido que publiques en WorkHoops, incluyendo:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                    <li>Información de perfil, experiencia y logros</li>
                    <li>Ofertas de empleo y descripciones de oportunidades</li>
                    <li>Fotos, videos y documentos</li>
                    <li>Comentarios y comunicaciones</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Licencia de contenido:</h3>
                  <p className="text-gray-700 mb-6">
                    Al publicar contenido, nos otorgas una licencia no exclusiva, mundial y libre de 
                    regalías para usar, mostrar y distribuir dicho contenido en relación con nuestros servicios.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Moderación:</h3>
                  <p className="text-gray-700 mb-6">
                    Nos reservamos el derecho de revisar, editar o eliminar contenido que consideremos 
                    inapropiado, inexacto o que viole estos términos.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="prohibited">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Usos prohibidos</h2>
                  
                  <p className="text-gray-700 mb-4">Está prohibido usar WorkHoops para:</p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>Publicar información falsa, engañosa o fraudulenta</li>
                    <li>Acosar, intimidar o discriminar a otros usuarios</li>
                    <li>Infringir derechos de propiedad intelectual</li>
                    <li>Distribuir spam, malware o contenido malicioso</li>
                    <li>Intentar acceder no autorizadamente a otros sistemas</li>
                    <li>Usar bots o automatizar acciones sin autorización</li>
                    <li>Publicar contenido obsceno, ofensivo o ilegal</li>
                    <li>Violar cualquier ley o regulación aplicable</li>
                  </ul>
                </section>

                <Separator className="my-8" />

                <section id="payment">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Pagos y reembolsos</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Servicios de pago:</h3>
                  <p className="text-gray-700 mb-4">
                    Algunos servicios requieren pago, incluyendo planes destacados y patrocinados 
                    para la publicación de ofertas.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturación:</h3>
                  <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                    <li>Los pagos se procesan a través de proveedores seguros</li>
                    <li>Los precios incluyen IVA cuando corresponde</li>
                    <li>Las suscripciones se renuevan automáticamente salvo cancelación</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reembolsos:</h3>
                  <p className="text-gray-700 mb-6">
                    Los reembolsos se evalúan caso por caso. Contacta con nuestro equipo de soporte 
                    para solicitudes de reembolso justificadas.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="liability">
                  <div className="flex items-center space-x-3 mb-4">
                    <Scale className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">7. Limitación de responsabilidad</h2>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Descargo de responsabilidad:</strong> WorkHoops se proporciona "tal como está" 
                      sin garantías de ningún tipo.
                    </p>
                  </div>

                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>No garantizamos que el servicio esté libre de interrupciones o errores</li>
                    <li>No somos responsables de las interacciones entre usuarios</li>
                    <li>No verificamos exhaustivamente toda la información publicada</li>
                    <li>Nuestra responsabilidad máxima está limitada al monto pagado por los servicios</li>
                  </ul>

                  <p className="text-gray-700 mb-6">
                    Los usuarios son responsables de verificar la legitimidad de las ofertas y 
                    organizaciones antes de comprometerse con cualquier oportunidad.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="termination">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Terminación</h2>
                  
                  <p className="text-gray-700 mb-4">
                    Podemos suspender o terminar tu acceso a WorkHoops en cualquier momento si:
                  </p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>Violas estos términos de uso</li>
                    <li>Proporcionas información falsa o engañosa</li>
                    <li>Participas en actividades fraudulentas</li>
                    <li>No pagas las tarifas aplicables</li>
                  </ul>

                  <p className="text-gray-700 mb-6">
                    También puedes cerrar tu cuenta en cualquier momento contactándanos o 
                    usando las opciones disponibles en tu perfil.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="governing-law">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Legislación aplicable</h2>
                  
                  <p className="text-gray-700 mb-6">
                    Estos términos se rigen por las leyes españolas. Cualquier disputa se resolverá 
                    en los tribunales competentes de Barcelona, España.
                  </p>

                  <p className="text-gray-700 mb-6">
                    Cumplimos con todas las regulaciones aplicables, incluyendo el RGPD para 
                    protección de datos y las leyes laborales españolas.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="contact">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
                  
                  <p className="text-gray-700 mb-4">
                    Para preguntas sobre estos términos o nuestros servicios:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                    <p className="text-gray-700"><strong>Email:</strong> legal@workhoops.es</p>
                    <p className="text-gray-700"><strong>Soporte:</strong> <Link to="/contacto" className="text-orange-600 hover:underline">Formulario de contacto</Link></p>
                    <p className="text-gray-700"><strong>Dirección:</strong> Barcelona, España</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-6">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                    Los cambios significativos se notificarán con 30 días de antelación.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;