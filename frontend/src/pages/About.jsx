import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Shield, Heart, CheckCircle, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Misión clara',
      description: 'Democratizar el acceso a oportunidades en el baloncesto español, conectando talento con las mejores ofertas.'
    },
    {
      icon: Shield,
      title: 'Transparencia',
      description: 'Verificamos manualmente todas las ofertas y organizaciones para garantizar la calidad y legitimidad.'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Construimos una comunidad sólida donde jugadores, entrenadores y clubs se conectan de forma auténtica.'
    },
    {
      icon: Heart,
      title: 'Pasión por el deporte',
      description: 'Amamos el baloncesto y creemos en el poder del deporte para cambiar vidas y crear oportunidades.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Oportunidades activas' },
    { number: '150+', label: 'Clubs registrados' },
    { number: '2,000+', label: 'Perfiles de talento' },
    { number: '95%', label: 'Tasa de satisfacción' }
  ];

  const team = [
    {
      name: 'Carlos Martínez',
      role: 'Fundador & CEO',
      bio: 'Ex-jugador profesional con 15 años de experiencia en ACB. Apasionado por conectar talento.',
      image: 'https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxzcG9ydHN8ZW58MHx8fHwxNzU5MDg4Nzg5fDA&ixlib=rb-4.1.0&q=85'
    },
    {
      name: 'Ana López',
      role: 'Head of Product',
      bio: 'Ingeniera de software especializada en plataformas deportivas. Construye experiencias que importan.',
      image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxzcG9ydHN8ZW58MHx8fHwxNzU5MDg4Nzg5fDA&ixlib=rb-4.1.0&q=85'
    },
    {
      name: 'Miguel Rodríguez',
      role: 'Head of Partnerships',
      bio: 'Relaciones con clubs y federaciones. 10+ años conectando organizaciones deportivas.',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85'
    }
  ];

  const partners = [
    { name: 'Federación Española de Baloncesto', logo: '🏀' },
    { name: 'Liga Endesa ACB', logo: '🏆' },
    { name: 'Federación Catalana de Basquet', logo: '🏀' },
    { name: 'Asociación de Clubes de Baloncesto', logo: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="about-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sobre WorkHoops
              </h1>
              <p className="text-gray-600">
                Conoce nuestra misión, valores y el equipo detrás de la plataforma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Democratizamos el talento del baloncesto español
              </h2>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Creamos WorkHoops porque creemos que cada jugador, entrenador y profesional 
                del baloncesto merece acceso a las mejores oportunidades, independientemente 
                de sus conexiones o ubicación.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white">{stat.number}</div>
                    <div className="text-orange-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/6763716/pexels-photo-6763716.jpeg"
                alt="Equipo de baloncesto"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros valores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estos principios guían cada decisión que tomamos y cada función que desarrollamos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra historia
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  WorkHoops nació en 2024 de la frustración personal de nuestro fundador, 
                  Carlos Martínez, quien durante su carrera profesional observó cómo muchos 
                  talentos se perdían por falta de visibilidad y conexiones.
                </p>
                <p>
                  Después de retirarse como jugador, Carlos decidió crear la plataforma que 
                  él hubiera querido tener: un lugar donde el mérito y la preparación fueran 
                  más importantes que los contactos personales.
                </p>
                <p>
                  Hoy, WorkHoops es la plataforma líder en España para oportunidades de 
                  baloncesto, con la confianza de clubs profesionales, federaciones y 
                  miles de jugadores y entrenadores.
                </p>
              </div>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Fundada por profesionales del baloncesto</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Más de 1,000 conexiones exitosas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Presencia en toda España</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-6 h-6 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Premio Innovación Deportiva 2024</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Reconocidos por la Federación Española de Baloncesto por nuestro 
                    impacto en la democratización del acceso al deporte profesional.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Star className="w-6 h-6 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Certificación RGPD</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Cumplimos con los más altos estándares de protección de datos 
                    y privacidad en la Unión Europea.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white" id="team">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestro equipo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Profesionales apasionados por el baloncesto y la tecnología
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-gray-50" id="partners">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros partners
            </h2>
            <p className="text-lg text-gray-600">
              Trabajamos con las principales organizaciones del baloncesto español
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{partner.logo}</div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {partner.name}
                  </h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-16 bg-white" id="prensa">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Media Kit
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Recursos para medios de comunicación y prensa
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Logotipos</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Logos en alta resolución en formatos PNG y SVG
                  </p>
                  <Button variant="outline" size="sm">Descargar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Kit de prensa</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Información corporativa, datos y estadísticas
                  </p>
                  <Button variant="outline" size="sm">Descargar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold mb-2">Contacto prensa</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    prensa@workhoops.es
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:prensa@workhoops.es">Contactar</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para unirte a nuestra misión?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Ayúdanos a democratizar el acceso a oportunidades en el baloncesto español
          </p>
          <div className="space-x-4">
            <Link to="/talento">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100" data-testid="join-talent-cta">
                Crear perfil
              </Button>
            </Link>
            <Link to="/publicar">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" data-testid="publish-opportunity-cta">
                Publicar oportunidad
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;