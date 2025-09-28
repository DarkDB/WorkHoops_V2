import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Crown, Star, Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Publish = () => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({
    tipo: '',
    titulo: '',
    organizacion_id: '',
    organizacion_nombre: '',
    ubicacion: '',
    modalidad: 'presencial',
    nivel: '',
    remuneracion: '',
    beneficios: '',
    fecha_limite: '',
    descripcion: '',
    requisitos: '',
    contacto: '',
    tags: '',
    cupos: '',
    enlace_externo: '',
    rgpd_consent: false
  });

  const opportunityTypes = [
    { value: 'empleo', label: 'Empleo', icon: '💼', description: 'Ofertas de trabajo fijo o temporal' },
    { value: 'prueba', label: 'Prueba', icon: '🏀', description: 'Pruebas de selección para equipos' },
    { value: 'torneo', label: 'Torneo', icon: '🏆', description: 'Competiciones y torneos' },
    { value: 'beca', label: 'Beca', icon: '🎓', description: 'Becas de estudio o deportivas' },
    { value: 'patrocinio', label: 'Patrocinio', icon: '🤝', description: 'Oportunidades de patrocinio' },
    { value: 'clinica', label: 'Clínica', icon: '📚', description: 'Clínicas y entrenamientos' }
  ];

  const levels = [
    { value: 'amateur', label: 'Amateur' },
    { value: 'semi-pro', label: 'Semi-profesional' },
    { value: 'cantera', label: 'Cantera' },
    { value: 'profesional', label: 'Profesional' }
  ];

  const cities = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 
    'Murcia', 'Zaragoza', 'Las Palmas', 'Alicante', 'Córdoba', 'Valladolid'
  ];

  useEffect(() => {
    fetchPlansAndOrganizations();
  }, []);

  const fetchPlansAndOrganizations = async () => {
    try {
      const [plansResponse, orgsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/plans`),
        axios.get(`${BACKEND_URL}/api/organizations`)
      ]);
      setPlans(plansResponse.data);
      setOrganizations(orgsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return formData.tipo && formData.titulo && formData.organizacion_nombre && 
           formData.ubicacion && formData.nivel && formData.descripcion && 
           formData.contacto && formData.rgpd_consent;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      // Create the opportunity
      const opportunityData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        cupos: formData.cupos ? parseInt(formData.cupos) : null,
        fecha_limite: formData.fecha_limite || null
      };

      await axios.post(`${BACKEND_URL}/api/opportunities`, opportunityData);
      
      toast.success('¡Oferta publicada correctamente! Será revisada por nuestro equipo.');
      setStep(4); // Success step
    } catch (error) {
      console.error('Error publishing opportunity:', error);
      toast.error('Error al publicar la oferta. Inténtalo de nuevo.');
    }
  };

  const PlanCard = ({ plan }) => (
    <Card className={`cursor-pointer transition-all ${selectedPlan === plan.id ? 'ring-2 ring-orange-500 border-orange-300' : 'hover:shadow-md'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {plan.nombre === 'Gratis' && <Check className="w-5 h-5 mr-2 text-green-500" />}
              {plan.nombre === 'Destacado' && <Star className="w-5 h-5 mr-2 text-orange-500" />}
              {plan.nombre === 'Patrocinado' && <Crown className="w-5 h-5 mr-2 text-purple-500" />}
              {plan.nombre}
            </CardTitle>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {plan.precio === 0 ? 'Gratis' : `${plan.precio}€`}
            </p>
          </div>
          {plan.destacar && (
            <Badge className="bg-orange-100 text-orange-800">Más popular</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {plan.beneficios.map((benefit, index) => (
            <li key={index} className="flex items-center text-sm">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
        <Button 
          variant={selectedPlan === plan.id ? "default" : "outline"}
          className="w-full"
          onClick={() => setSelectedPlan(plan.id)}
          data-testid={`select-plan-${plan.nombre.toLowerCase()}`}
        >
          {selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar'}
        </Button>
      </CardContent>
    </Card>
  );

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Oferta enviada correctamente!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Tu oferta ha sido enviada y será revisada por nuestro equipo en las próximas 24 horas. 
              Te notificaremos cuando esté publicada.
            </p>
            <div className="space-y-4">
              <Link to="/oportunidades">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Ver todas las oportunidades
                </Button>
              </Link>
              <Link to="/publicar" className="block">
                <Button variant="outline">
                  Publicar otra oferta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="publish-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Publicar oportunidad
            </h1>
            <p className="text-gray-600">
              Conecta con el mejor talento del baloncesto español
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 ${step > stepNum ? 'bg-orange-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            {step === 1 && 'Detalles de la oferta'}
            {step === 2 && 'Seleccionar plan'}
            {step === 3 && 'Confirmar y pagar'}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Opportunity Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la oportunidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Tipo de oportunidad *</Label>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opportunityTypes.map((type) => (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all ${formData.tipo === type.value ? 'ring-2 ring-orange-500 border-orange-300' : 'hover:shadow-md'}`}
                        onClick={() => updateFormData('tipo', type.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <h3 className="font-semibold mb-1">{type.label}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="titulo">Título de la oferta *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Entrenador cantera masculina U16"
                      value={formData.titulo}
                      onChange={(e) => updateFormData('titulo', e.target.value)}
                      required
                      data-testid="titulo-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="organizacion">Organización *</Label>
                    <Input
                      id="organizacion"
                      placeholder="Nombre de tu club/organización"
                      value={formData.organizacion_nombre}
                      onChange={(e) => updateFormData('organizacion_nombre', e.target.value)}
                      required
                      data-testid="organizacion-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="ubicacion">Ubicación *</Label>
                    <Select value={formData.ubicacion} onValueChange={(value) => updateFormData('ubicacion', value)}>
                      <SelectTrigger data-testid="ubicacion-select">
                        <SelectValue placeholder="Selecciona ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="modalidad">Modalidad</Label>
                    <Select value={formData.modalidad} onValueChange={(value) => updateFormData('modalidad', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hibrida">Híbrida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nivel">Nivel *</Label>
                    <Select value={formData.nivel} onValueChange={(value) => updateFormData('nivel', value)}>
                      <SelectTrigger data-testid="nivel-select">
                        <SelectValue placeholder="Selecciona nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="remuneracion">Remuneración/Beneficios</Label>
                    <Input
                      id="remuneracion"
                      placeholder="Ej: 30.000€ - 40.000€ anuales"
                      value={formData.remuneracion}
                      onChange={(e) => updateFormData('remuneracion', e.target.value)}
                      data-testid="remuneracion-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_limite">Fecha límite</Label>
                    <Input
                      id="fecha_limite"
                      type="date"
                      value={formData.fecha_limite}
                      onChange={(e) => updateFormData('fecha_limite', e.target.value)}
                      data-testid="fecha-limite-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe la oportunidad, responsabilidades, qué buscas..."
                    value={formData.descripcion}
                    onChange={(e) => updateFormData('descripcion', e.target.value)}
                    rows={4}
                    required
                    data-testid="descripcion-textarea"
                  />
                </div>

                <div>
                  <Label htmlFor="requisitos">Requisitos</Label>
                  <Textarea
                    id="requisitos"
                    placeholder="Experiencia necesaria, títulos, habilidades..."
                    value={formData.requisitos}
                    onChange={(e) => updateFormData('requisitos', e.target.value)}
                    rows={3}
                    data-testid="requisitos-textarea"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contacto">Email de contacto *</Label>
                    <Input
                      id="contacto"
                      type="email"
                      placeholder="contacto@tuclub.com"
                      value={formData.contacto}
                      onChange={(e) => updateFormData('contacto', e.target.value)}
                      required
                      data-testid="contacto-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cupos">Número de plazas</Label>
                    <Input
                      id="cupos"
                      type="number"
                      placeholder="Ej: 15"
                      value={formData.cupos}
                      onChange={(e) => updateFormData('cupos', e.target.value)}
                      data-testid="cupos-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separados por comas)</Label>
                  <Input
                    id="tags"
                    placeholder="Ej: entrenador, cantera, barcelona"
                    value={formData.tags}
                    onChange={(e) => updateFormData('tags', e.target.value)}
                    data-testid="tags-input"
                  />
                </div>

                <div>
                  <Label htmlFor="enlace_externo">Enlace externo (opcional)</Label>
                  <Input
                    id="enlace_externo"
                    type="url"
                    placeholder="https://tuclub.com/aplicar"
                    value={formData.enlace_externo}
                    onChange={(e) => updateFormData('enlace_externo', e.target.value)}
                    data-testid="enlace-externo-input"
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="rgpd"
                        checked={formData.rgpd_consent}
                        onCheckedChange={(checked) => updateFormData('rgpd_consent', checked)}
                        data-testid="rgpd-checkbox"
                      />
                      <Label htmlFor="rgpd" className="text-sm">
                        Acepto la <Link to="/privacidad" className="text-orange-600 hover:underline">política de privacidad</Link> y 
                        los <Link to="/terminos" className="text-orange-600 hover:underline">términos de uso</Link> *
                      </Label>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button onClick={handleNext} disabled={!validateStep1()} data-testid="next-step-btn">
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Selecciona tu plan</CardTitle>
                  <p className="text-gray-600">
                    Elige el plan que mejor se adapte a tus necesidades
                  </p>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Volver
                </Button>
                <Button onClick={handleNext} disabled={!selectedPlan} data-testid="select-plan-btn">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Confirmar publicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Resumen de tu oferta</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{formData.titulo}</p>
                      <p className="text-gray-600">{formData.organizacion_nombre} - {formData.ubicacion}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Plan seleccionado</h3>
                    {plans.find(p => p.id === selectedPlan) && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-medium">{plans.find(p => p.id === selectedPlan).nombre}</p>
                        <p className="text-orange-600">
                          {plans.find(p => p.id === selectedPlan).precio === 0 
                            ? 'Gratis' 
                            : `${plans.find(p => p.id === selectedPlan).precio}€`}
                        </p>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tu oferta será revisada manualmente por nuestro equipo antes de ser publicada. 
                      Recibirás una confirmación por email en las próximas 24 horas.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Volver
                    </Button>
                    <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700" data-testid="publish-btn">
                      {plans.find(p => p.id === selectedPlan)?.precio === 0 
                        ? 'Publicar gratis' 
                        : 'Proceder al pago'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publish;