import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    categoria: '',
    mensaje: '',
    rgpd_consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'soporte', label: 'Soporte técnico' },
    { value: 'publicacion', label: 'Publicación de ofertas' },
    { value: 'cuenta', label: 'Problemas con mi cuenta' },
    { value: 'verificacion', label: 'Verificación de perfil' },
    { value: 'prensa', label: 'Prensa y medios' },
    { value: 'partnerships', label: 'Partnerships y colaboraciones' },
    { value: 'legal', label: 'Asuntos legales' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rgpd_consent) {
      toast.error('Debes aceptar la política de privacidad');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post(`${BACKEND_URL}/api/contact`, formData);
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      
      // Reset form
      setFormData({
        nombre: '',
        email: '',
        categoria: '',
        mensaje: '',
        rgpd_consent: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="contact-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contacto
            </h1>
            <p className="text-gray-600">
              Estamos aquí para ayudarte. Contacta con nosotros por cualquier consulta
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Información de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600 text-sm">hola@workhoops.es</p>
                    <p className="text-gray-600 text-sm">soporte@workhoops.es</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Ubicación</h4>
                    <p className="text-gray-600 text-sm">Barcelona, España</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Horario de atención</h4>
                    <p className="text-gray-600 text-sm">Lunes a Viernes</p>
                    <p className="text-gray-600 text-sm">9:00 - 18:00 CET</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Otros canales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">WhatsApp</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Para consultas rápidas y soporte urgente
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a 
                      href="https://wa.me/34600123456?text=Hola%20WorkHoops"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="whatsapp-button"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Abrir WhatsApp
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reunión online</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Agenda una videollamada con nuestro equipo
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a 
                      href="https://calendly.com/workhoops/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="calendly-button"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Agendar reunión
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQ Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">¿Cómo verifico mi perfil?</h4>
                    <p className="text-gray-600">Envía documentos de identificación y experiencia a verificacion@workhoops.es</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">¿Cuánto tarda en publicarse una oferta?</h4>
                    <p className="text-gray-600">Las ofertas se revisan en 24-48 horas hábiles</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">¿Es gratis para jugadores?</h4>
                    <p className="text-gray-600">Sí, crear perfil y aplicar a ofertas es completamente gratuito</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <p className="text-gray-600">
                  Completa el formulario y te responderemos lo antes posible
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nombre">Nombre completo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => updateFormData('nombre', e.target.value)}
                        required
                        data-testid="nombre-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                        data-testid="email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoría de consulta *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => updateFormData('categoria', value)}>
                      <SelectTrigger data-testid="categoria-select">
                        <SelectValue placeholder="Selecciona el tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      placeholder="Describe tu consulta con el mayor detalle posible..."
                      value={formData.mensaje}
                      onChange={(e) => updateFormData('mensaje', e.target.value)}
                      rows={6}
                      required
                      data-testid="mensaje-textarea"
                    />
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start space-x-2 mt-2">
                        <Checkbox
                          id="rgpd"
                          checked={formData.rgpd_consent}
                          onCheckedChange={(checked) => updateFormData('rgpd_consent', checked)}
                          data-testid="rgpd-checkbox"
                        />
                        <Label htmlFor="rgpd" className="text-sm leading-relaxed">
                          Acepto que mis datos sean utilizados para responder a esta consulta 
                          según la <Link to="/privacidad" className="text-orange-600 hover:underline">política de privacidad</Link> *
                        </Label>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-orange-600 hover:bg-orange-700 min-w-[120px]"
                      disabled={isSubmitting}
                      data-testid="submit-button"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Response time info */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Tiempo de respuesta</h4>
                    <p className="text-gray-600 text-sm">
                      Normalmente respondemos en menos de 24 horas. Para consultas urgentes, 
                      usa WhatsApp o agenda una reunión directa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;