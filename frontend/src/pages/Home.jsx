import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin, Clock, Star, Shield, CheckCircle, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [oppsResponse, testimonialsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/opportunities?limit=6`),
        axios.get(`${BACKEND_URL}/api/testimonials`)
      ]);

      setOpportunities(oppsResponse.data);
      setTestimonials(testimonialsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/newsletter/subscribe`, { email });
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }
  };

  const getOpportunityTypeLabel = (type) => {
    const labels = {
      empleo: 'Empleo',
      prueba: 'Prueba',
      torneo: 'Torneo',
      beca: 'Beca',
      patrocinio: 'Patrocinio',
      clinica: 'Clínica'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      empleo: 'bg-green-100 text-green-800',
      prueba: 'bg-blue-100 text-blue-800',
      torneo: 'bg-purple-100 text-purple-800',
      beca: 'bg-orange-100 text-orange-800',
      patrocinio: 'bg-pink-100 text-pink-800',
      clinica: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Verificamos todas las ofertas manualmente</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight" data-testid="hero-title">
                  Tu próximo salto en el{' '}
                  <span className="text-orange-600">baloncesto</span>{' '}
                  empieza aquí
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed" data-testid="hero-subtitle">
                  Encuentra pruebas, torneos, becas, equipos y trabajos. 
                  Conecta con quien busca tu talento en el baloncesto español.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/oportunidades">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8 py-4 text-lg" data-testid="explore-opportunities-btn">
                    <Search className="w-5 h-5 mr-2" />
                    Explorar oportunidades
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link to="/publicar">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2" data-testid="publish-offer-btn">
                    Publicar una oferta
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>RGPD compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Ofertas verificadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Gratuito para jugadores</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85"
                  alt="Jugadores de baloncesto en acción"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border">
                <div className="text-2xl font-bold text-orange-600">500+</div>
                <div className="text-sm text-gray-600">Oportunidades activas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white" data-testid="how-it-works">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cómo funciona WorkHoops
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En tres sencillos pasos conectamos el talento con las oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Descubre</h3>
              <p className="text-gray-600">
                Explora cientos de oportunidades verificadas: empleos, pruebas, torneos, becas y patrocinios.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Aplica</h3>
              <p className="text-gray-600">
                Aplica directamente desde la plataforma o crea tu perfil para que los clubs te encuentren.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Juega/Trabaja</h3>
              <p className="text-gray-600">
                Encuentra tu lugar en el baloncesto español y da el salto profesional que mereces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-16 bg-gray-50" data-testid="featured-opportunities">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Oportunidades destacadas
              </h2>
              <p className="text-lg text-gray-600">
                Las últimas ofertas verificadas por nuestro equipo
              </p>
            </div>
            <Link to="/oportunidades">
              <Button variant="outline" className="hidden sm:flex">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getTypeColor(opp.tipo)}>
                        {getOpportunityTypeLabel(opp.tipo)}
                      </Badge>
                      {opp.verificacion && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {opp.titulo}
                    </CardTitle>
                    <div className="text-sm text-gray-600">
                      {opp.organizacion_nombre}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {opp.ubicacion}
                      </div>
                      {opp.remuneracion && (
                        <div className="text-sm font-medium text-green-700">
                          {opp.remuneracion}
                        </div>
                      )}
                      {opp.fecha_limite && (
                        <div className="flex items-center text-sm text-orange-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Hasta {new Date(opp.fecha_limite).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/oportunidades/${opp.slug}`}>
                      <Button variant="outline" className="w-full" data-testid={`opportunity-card-${opp.id}`}>
                        Ver detalles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 sm:hidden">
            <Link to="/oportunidades">
              <Button>
                Ver todas las oportunidades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white" data-testid="testimonials">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Historias de éxito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jugadores, entrenadores y clubs que han encontrado su oportunidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.slice(0, 2).map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {testimonial.foto ? (
                      <img 
                        src={testimonial.foto}
                        alt={testimonial.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4 italic">"{testimonial.texto}"</p>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.nombre}</div>
                      <div className="text-sm text-gray-500">{testimonial.rol}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Crea tu perfil de talento gratis
          </h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Sube tu CV deportivo, highlights y que los clubs te encuentren. 
            Es completamente gratuito para jugadores y entrenadores.
          </p>
          <Link to="/talento">
            <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4" data-testid="create-talent-profile-btn">
              Crear perfil gratuito
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900" data-testid="newsletter-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Recibe oportunidades cada semana
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Suscríbete a nuestra newsletter y no te pierdas las mejores ofertas. Sin spam, solo oportunidades reales.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" data-testid="newsletter-form">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white"
                data-testid="newsletter-email-input"
              />
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" data-testid="newsletter-submit">
                Suscribirse
              </Button>
            </form>
            
            {newsletterStatus === 'success' && (
              <p className="mt-4 text-green-400" data-testid="newsletter-success">
                ¡Te has suscrito correctamente!
              </p>
            )}
            {newsletterStatus === 'error' && (
              <p className="mt-4 text-red-400" data-testid="newsletter-error">
                Ha ocurrido un error. Inténtalo de nuevo.
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-4">
              Al suscribirte, aceptas nuestra <Link to="/privacidad" className="underline">política de privacidad</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;