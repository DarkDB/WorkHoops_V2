'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, MessageCircle, Calendar, Send, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Navbar } from '@/components/Navbar'

const contactReasons = [
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'prensa', label: 'Prensa y medios' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'feedback', label: 'Sugerencias' },
  { value: 'legal', label: 'Consultas legales' },
  { value: 'otro', label: 'Otro motivo' }
]

const contactMethods = [
  {
    icon: <Mail className="w-6 h-6 text-workhoops-accent" />,
    title: 'Email',
    description: 'Te respondemos en menos de 24h',
    contact: 'hola@workhoops.es',
    action: 'Enviar email'
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-workhoops-accent" />,
    title: 'WhatsApp',
    description: 'Respuesta inmediata en horario laboral',
    contact: '+34 600 000 000',
    action: 'Abrir WhatsApp'
  },
  {
    icon: <Calendar className="w-6 h-6 text-workhoops-accent" />,
    title: 'Videollamada',
    description: 'Agenda una reunión personalizada',
    contact: 'Lun-Vie 9:00-18:00',
    action: 'Reservar cita'
  }
]

const officeHours = [
  { day: 'Lunes - Viernes', hours: '9:00 - 18:00' },
  { day: 'Sábados', hours: '10:00 - 14:00' },
  { day: 'Domingos', hours: 'Cerrado' }
]

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-workhoops-primary leading-tight">
                Estamos aquí para{' '}
                <span className="text-workhoops-accent">ayudarte</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                ¿Tienes preguntas sobre WorkHoops? ¿Necesitas ayuda con tu perfil o una oferta? 
                Nuestro equipo está listo para asistirte.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Respuesta en 24h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Soporte humano</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-workhoops-accent" />
                <span>Múltiples canales</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Elige cómo contactarnos
            </h2>
            <p className="text-lg text-gray-600">
              Selecciona el método que prefieras según tu necesidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-workhoops-accent group-hover:text-white transition-colors">
                    {method.icon}
                  </div>
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900 mb-4">{method.contact}</p>
                  <Button className="w-full group-hover:bg-workhoops-accent group-hover:border-workhoops-accent">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Envíanos un mensaje
              </h2>
              
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input 
                          id="firstName" 
                          placeholder="María"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Apellidos *</Label>
                        <Input 
                          id="lastName" 
                          placeholder="García López"
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="maria@email.com"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="+34 600 000 000"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Motivo de contacto *</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input 
                        id="subject" 
                        placeholder="Describe brevemente tu consulta"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea 
                        id="message"
                        placeholder="Cuéntanos más detalles sobre tu consulta..."
                        className="mt-1 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="rgpd" required />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="rgpd" className="text-sm font-medium">
                            Acepto el tratamiento de mis datos *
                          </Label>
                          <p className="text-xs text-gray-500">
                            He leído y acepto la{' '}
                            <Link href="/legal/privacidad" className="text-workhoops-accent hover:underline">
                              política de privacidad
                            </Link>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="newsletter" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="newsletter" className="text-sm font-medium">
                            Quiero recibir el newsletter de WorkHoops
                          </Label>
                          <p className="text-xs text-gray-500">
                            Recursos y oportunidades cada semana (opcional)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </Button>

                    <div className="text-center text-sm text-gray-500">
                      <p>
                        Te responderemos en menos de 24 horas en días laborables
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Información de contacto
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-workhoops-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email general</h4>
                      <p className="text-gray-600">hola@workhoops.es</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-workhoops-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Teléfono/WhatsApp</h4>
                      <p className="text-gray-600">+34 600 000 000</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-workhoops-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ubicación</h4>
                      <p className="text-gray-600">
                        Barcelona, España<br/>
                        <span className="text-sm">(Trabajo remoto)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Horarios de atención
                </h3>
                
                <div className="bg-white rounded-lg p-6 space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  * Los mensajes recibidos fuera del horario laboral serán respondidos 
                  el siguiente día hábil
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Preguntas frecuentes
                </h3>
                
                <div className="space-y-3">
                  <Link href="/recursos" className="block bg-white rounded-lg p-4 hover:bg-orange-50 transition-colors group">
                    <h4 className="font-medium text-gray-900 group-hover:text-workhoops-accent">
                      ¿Cómo creo mi perfil de jugador?
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Guía paso a paso en nuestros recursos →
                    </p>
                  </Link>
                  
                  <Link href="/planes" className="block bg-white rounded-lg p-4 hover:bg-orange-50 transition-colors group">
                    <h4 className="font-medium text-gray-900 group-hover:text-workhoops-accent">
                      ¿Qué planes tenéis disponibles?
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Ver todos los precios y funcionalidades →
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 bg-workhoops-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Necesitas ayuda inmediata?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Escríbenos por WhatsApp y te responderemos al instante
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="px-8 py-4"
            onClick={() => window.open('https://wa.me/34600000000?text=Hola%20WorkHoops', '_blank')}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Abrir WhatsApp
          </Button>
        </div>
      </section>
    </div>
  )
}