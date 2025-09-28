import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="privacy-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Política de Privacidad
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
                <a href="#introduction" className="block text-sm text-gray-600 hover:text-orange-600">
                  1. Introducción
                </a>
                <a href="#data-collection" className="block text-sm text-gray-600 hover:text-orange-600">
                  2. Datos que recopilamos
                </a>
                <a href="#data-usage" className="block text-sm text-gray-600 hover:text-orange-600">
                  3. Uso de datos
                </a>
                <a href="#data-sharing" className="block text-sm text-gray-600 hover:text-orange-600">
                  4. Compartir datos
                </a>
                <a href="#cookies" className="block text-sm text-gray-600 hover:text-orange-600">
                  5. Cookies
                </a>
                <a href="#rights" className="block text-sm text-gray-600 hover:text-orange-600">
                  6. Tus derechos
                </a>
                <a href="#rgpd" className="block text-sm text-gray-600 hover:text-orange-600">
                  7. RGPD
                </a>
                <a href="#contact" className="block text-sm text-gray-600 hover:text-orange-600">
                  8. Contacto
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8 prose prose-gray max-w-none">
                <section id="introduction">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Introducción</h2>
                  </div>
                  <p className="text-gray-700 mb-6">
                    En WorkHoops respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                    Esta política de privacidad explica cómo recopilamos, usamos y protegemos tu información 
                    cuando utilizas nuestra plataforma.
                  </p>
                  <p className="text-gray-700 mb-6">
                    WorkHoops es una plataforma que conecta talento del baloncesto con oportunidades profesionales 
                    en España. Cumplimos con el Reglamento General de Protección de Datos (RGPD) de la UE.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="data-collection">
                  <div className="flex items-center space-x-3 mb-4">
                    <Eye className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">2. Datos que recopilamos</h2>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información que nos proporcionas:</h3>
                  <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                    <li>Datos de perfil (nombre, email, teléfono, ubicación)</li>
                    <li>Información deportiva (posición, altura, experiencia)</li>
                    <li>CV deportivo y enlaces a highlights</li>
                    <li>Datos de organizaciones (nombre, descripción, contacto)</li>
                    <li>Ofertas y oportunidades publicadas</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información automática:</h3>
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>Direcciones IP y datos de ubicación aproximada</li>
                    <li>Información del navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de navegación</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </section>

                <Separator className="my-8" />

                <section id="data-usage">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">3. Uso de datos</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-4">Utilizamos tus datos para:</p>
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li><strong>Proporcionar el servicio:</strong> Conectar talento con oportunidades</li>
                    <li><strong>Comunicación:</strong> Notificaciones de oportunidades relevantes</li>
                    <li><strong>Mejora del servicio:</strong> Análisis y optimización de la plataforma</li>
                    <li><strong>Verificación:</strong> Validar perfiles y ofertas para mayor seguridad</li>
                    <li><strong>Marketing:</strong> Newsletter y promociones (solo con consentimiento)</li>
                    <li><strong>Legal:</strong> Cumplir con obligaciones legales y resolver disputas</li>
                  </ul>
                  
                  <div className="bg-orange-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-orange-800">
                      <strong>Base legal:</strong> Procesamos tus datos basándonos en tu consentimiento, 
                      ejecución del contrato, intereses legítimos y cumplimiento de obligaciones legales.
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                <section id="data-sharing">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir datos</h2>
                  
                  <p className="text-gray-700 mb-4">
                    No vendemos tus datos personales. Los compartimos únicamente en estas situaciones:
                  </p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li><strong>Con tu consentimiento:</strong> Al aplicar a ofertas o hacer público tu perfil</li>
                    <li><strong>Proveedores de servicios:</strong> Email, hosting, análisis (con contratos de protección)</li>
                    <li><strong>Obligaciones legales:</strong> Cuando sea requerido por ley o autoridades</li>
                    <li><strong>Protección:</strong> Para prevenir fraude o proteger derechos y seguridad</li>
                  </ul>
                </section>

                <Separator className="my-8" />

                <section id="cookies">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
                  
                  <p className="text-gray-700 mb-4">
                    Utilizamos cookies y tecnologías similares para mejorar tu experiencia:
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies necesarias</h4>
                      <p className="text-sm text-gray-600">Esenciales para el funcionamiento del sitio</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies analíticas</h4>
                      <p className="text-sm text-gray-600">Nos ayudan a entender cómo usas el sitio</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">Cookies de marketing</h4>
                      <p className="text-sm text-gray-600">Para mostrar contenido relevante y medir campañas</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    Puedes gestionar tus preferencias de cookies a través del banner que aparece 
                    al visitar el sitio por primera vez.
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="rights">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tus derechos</h2>
                  
                  <p className="text-gray-700 mb-4">Bajo el RGPD, tienes los siguientes derechos:</p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                    <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                    <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                    <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                    <li><strong>Limitación:</strong> Restringir el procesamiento en ciertos casos</li>
                    <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                    <li><strong>Oposición:</strong> Oponerte al procesamiento basado en intereses legítimos</li>
                    <li><strong>Retirar consentimiento:</strong> En cualquier momento para procesos basados en consentimiento</li>
                  </ul>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Para ejercer cualquiera de estos derechos, contacta con nosotros en 
                      <a href="mailto:privacidad@workhoops.es" className="underline ml-1">privacidad@workhoops.es</a>
                    </p>
                  </div>
                </section>

                <Separator className="my-8" />

                <section id="rgpd">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cumplimiento del RGPD</h2>
                  
                  <p className="text-gray-700 mb-4">
                    Como plataforma que opera en España y la UE, WorkHoops cumple plenamente con el RGPD:
                  </p>
                  
                  <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
                    <li>Procesamos datos con bases legales válidas</li>
                    <li>Implementamos medidas de seguridad técnicas y organizativas</li>
                    <li>Realizamos evaluaciones de impacto cuando es necesario</li>
                    <li>Notificamos brechas de datos a autoridades cuando procede</li>
                    <li>Mantenemos registros de actividades de procesamiento</li>
                  </ul>
                  
                  <p className="text-gray-700 mb-6">
                    Si no estás satisfecho con cómo manejamos tus datos, tienes derecho a presentar 
                    una reclamación ante la Agencia Española de Protección de Datos (AEPD).
                  </p>
                </section>

                <Separator className="my-8" />

                <section id="contact">
                  <div className="flex items-center space-x-3 mb-4">
                    <Mail className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-0">8. Contacto</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                    <p className="text-gray-700"><strong>Email:</strong> privacidad@workhoops.es</p>
                    <p className="text-gray-700"><strong>Dirección:</strong> Barcelona, España</p>
                    <p className="text-gray-700"><strong>Responsable del tratamiento:</strong> WorkHoops</p>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-6">
                    Esta política puede actualizarse ocasionalmente. Te notificaremos de cambios 
                    significativos por email o mediante aviso en la plataforma.
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

export default Privacy;