import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Star, Zap, HelpCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Fallback plans if API fails
      setPlans([
        {
          id: 'gratis',
          nombre: 'Gratis',
          precio: 0,
          beneficios: [
            'Publicación básica',
            'Visibilidad 30 días',
            'Soporte por email',
            '1 publicación simultánea'
          ],
          limite_publicaciones: 1,
          destacar: false
        },
        {
          id: 'destacado',
          nombre: 'Destacado',
          precio: 49,
          beneficios: [
            'Publicación destacada',
            'Visibilidad 60 días',
            'Promoción en redes sociales',
            'Soporte prioritario',
            '3 publicaciones simultáneas'
          ],
          limite_publicaciones: 3,
          destacar: true
        },
        {
          id: 'patrocinado',
          nombre: 'Patrocinado',
          precio: 99,
          beneficios: [
            'Banner principal',
            'Newsletter dedicada',
            'Visibilidad 90 días',
            'Promoción en redes sociales',
            'Soporte telefónico',
            '10 publicaciones simultáneas'
          ],
          limite_publicaciones: 10,
          destacar: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: '¿Es realmente gratis para jugadores y entrenadores?',
      answer: 'Sí, crear un perfil, buscar oportunidades y aplicar a ofertas es completamente gratuito para todo el talento. Solo cobramos a las organizaciones que publican ofertas.'
    },
    {
      question: '¿Qué incluye la moderación de ofertas?',
      answer: 'Nuestro equipo revisa manualmente cada oferta para verificar que sea legítima, esté bien descrita y cumpla con nuestros estándares de calidad. Rechazamos ofertas fraudulentas o de baja calidad.'
    },
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican al siguiente período de facturación.'
    },
    {
      question: '¿Ofrecen reembolsos?',
      answer: 'Evaluamos las solicitudes de reembolso caso por caso, especialmente si hay problemas técnicos o la oferta no se publica según lo acordado.'
    },
    {
      question: '¿Hay descuentos por volumen?',
      answer: 'Sí, ofrecemos descuentos especiales para organizaciones que publican regularmente múltiples ofertas. Contacta con nuestro equipo comercial.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito/débito principales, transferencias bancarias y PayPal. Todos los pagos son procesados de forma segura.'
    }
  ];

  const features = [
    { name: 'Verificación manual de ofertas', all: true },
    { name: 'Soporte por email', all: true },
    { name: 'Panel de control básico', all: true },
    { name: 'Visibilidad en búsquedas', all: true },
    { name: 'Promoción en redes sociales', destacado: true, patrocinado: true },
    { name: 'Soporte prioritario', destacado: true, patrocinado: true },
    { name: 'Banner principal', patrocinado: true },
    { name: 'Newsletter dedicada', patrocinado: true },
    { name: 'Soporte telefónico', patrocinado: true },
    { name: 'Account manager dedicado', patrocinado: true }
  ];

  const PlanCard = ({ plan }) => (
    <Card className={`relative overflow-hidden ${plan.destacar ? 'ring-2 ring-orange-500 border-orange-300' : ''}`}>
      {plan.destacar && (
        <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-medium">
          Más popular
        </div>
      )}
      
      <CardHeader className={plan.destacar ? 'pt-12' : ''}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              {plan.nombre === 'Gratis' && <Check className="w-5 h-5 mr-2 text-green-500" />}
              {plan.nombre === 'Destacado' && <Star className="w-5 h-5 mr-2 text-orange-500" />}
              {plan.nombre === 'Patrocinado' && <Crown className="w-5 h-5 mr-2 text-purple-500" />}
              {plan.nombre}
            </CardTitle>
            <p className="text-3xl font-bold text-gray-900 mt-3">
              {plan.precio === 0 ? 'Gratis' : `${plan.precio}€`}
              {plan.precio > 0 && <span className="text-sm text-gray-600 font-normal">/oferta</span>}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {plan.beneficios.map((benefit, index) => (
            <li key={index} className="flex items-start text-sm">
              <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <Separator />
        
        <div className="text-sm text-gray-600">
          <p><strong>Límite:</strong> {plan.limite_publicaciones ? `${plan.limite_publicaciones} publicaciones simultáneas` : 'Ilimitado'}</p>
        </div>
        
        <Link to="/publicar">
          <Button 
            className={`w-full ${plan.destacar ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            variant={plan.destacar ? 'default' : 'outline'}
            data-testid={`select-plan-${plan.nombre.toLowerCase()}`}
          >
            {plan.precio === 0 ? 'Empezar gratis' : 'Seleccionar plan'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="pricing-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Precios
              </h1>
              <p className="text-gray-600">
                Planes flexibles para organizaciones de todos los tamaños
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                100% gratuito para jugadores, entrenadores y staff técnico
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Elige el plan perfecto para tu organización
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Desde clubs amateur hasta organizaciones profesionales, tenemos 
              un plan que se adapta a tus necesidades y presupuesto.
            </p>
          </div>

          {loading ? (
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comparación detallada
            </h2>
            <p className="text-lg text-gray-600">
              Todas las características incluidas en cada plan
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Características
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Gratis
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Destacado
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      Patrocinado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(feature.all || feature.gratis) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(feature.all || feature.destacado) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(feature.all || feature.patrocinado) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-gray-600">
              Resolvemos las dudas más comunes sobre nuestros planes
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-3 text-orange-600" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600 ml-8">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Garantía de calidad
              </h3>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Todas nuestras ofertas pasan por un proceso de moderación manual. 
                Si una oferta no cumple con nuestros estándares de calidad, 
                te devolvemos el 100% de tu dinero.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Verificación manual</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Soporte 24/7</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Sin compromisos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para encontrar tu próximo talento?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de organizaciones que ya confían en WorkHoops 
            para sus necesidades de reclutamiento
          </p>
          <div className="space-x-4">
            <Link to="/publicar">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100" data-testid="start-publishing-cta">
                Empezar a publicar
              </Button>
            </Link>
            <Link to="/contacto">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" data-testid="contact-sales-cta">
                Hablar con ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;