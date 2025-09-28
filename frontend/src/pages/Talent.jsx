import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Shield, Zap, CheckCircle, Camera, Video, FileText, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Talent = () => {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: '',
    posicion: '',
    altura: '',
    ciudad: '',
    highlights_url: '',
    bio: '',
    foto: '',
    disponibilidad_viajar: true
  });

  const roles = [
    { value: 'jugador', label: 'Jugador/a', icon: '🏀' },
    { value: 'entrenador', label: 'Entrenador/a', icon: '👨‍💼' },
    { value: 'fisio', label: 'Fisioterapeuta', icon: '🩺' },
    { value: 'arbitro', label: 'Árbitro', icon: '👕' },
    { value: 'staff', label: 'Staff técnico', icon: '📋' }
  ];

  const positions = [
    'Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot', 'Versátil'
  ];

  const cities = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 
    'Murcia', 'Zaragoza', 'Las Palmas', 'Alicante', 'Córdoba', 'Valladolid'
  ];

  useEffect(() => {
    fetchTalentProfiles();
  }, []);

  const fetchTalentProfiles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users?limit=12`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching talent profiles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/users`, {
        ...formData,
        altura: formData.altura ? parseInt(formData.altura) : null
      });
      
      toast.success('¡Perfil creado correctamente! Ya puedes empezar a recibir oportunidades.');
      setShowForm(false);
      setFormData({
        nombre: '',
        email: '',
        rol: '',
        posicion: '',
        altura: '',
        ciudad: '',
        highlights_url: '',
        bio: '',
        foto: '',
        disponibilidad_viajar: true
      });
      fetchTalentProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Error al crear el perfil. Inténtalo de nuevo.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="talent-page">
      {!showForm ? (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                    Crea tu perfil de talento
                  </h1>
                  <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                    Construye tu CV deportivo y que los mejores clubs de España te encuentren. 
                    Es completamente gratuito para jugadores y entrenadores.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-orange-200" />
                      <span>Perfil profesional verificado</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-orange-200" />
                      <span>Alertas personalizadas por email</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-orange-200" />
                      <span>Visibilidad ante clubs y ojeadores</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-orange-200" />
                      <span>100% gratuito, siempre</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                    onClick={() => setShowForm(true)}
                    data-testid="create-profile-btn"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Crear perfil gratuito
                  </Button>
                </div>

                <div className="hidden lg:block">
                  <img
                    src="https://images.pexels.com/photos/6763716/pexels-photo-6763716.jpeg"
                    alt="Jugadores de baloncesto entrenando"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ¿Por qué crear tu perfil?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tu perfil es tu carta de presentación ante clubs, entrenadores y ojeadores
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Visibilidad máxima</h3>
                    <p className="text-gray-600">
                      Los clubs pueden encontrarte y contactarte directamente cuando busquen tu perfil.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Perfil verificado</h3>
                    <p className="text-gray-600">
                      Obtén la insignia de verificación que genera confianza y credibilidad.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Alertas inteligentes</h3>
                    <p className="text-gray-600">
                      Recibe notificaciones de oportunidades que coinciden con tu perfil y ubicación.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Featured Talents */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Perfiles destacados
                  </h2>
                  <p className="text-lg text-gray-600">
                    Conoce algunos de los talentos que ya confían en WorkHoops
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {users.slice(0, 8).map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-4">
                        <AvatarImage src={user.foto} alt={user.nombre} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-semibold">
                          {user.nombre.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{user.nombre}</h3>
                      <p className="text-sm text-gray-600 mb-2 capitalize">{user.rol}</p>
                      
                      {user.posicion && (
                        <Badge variant="secondary" className="mb-2">
                          {user.posicion}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.ciudad}
                      </div>
                      
                      {user.verificado && (
                        <div className="flex items-center justify-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Verificado</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-orange-600">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                ¿Listo para dar el siguiente paso?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Únete a cientos de jugadores y entrenadores que ya han encontrado su oportunidad
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                onClick={() => setShowForm(true)}
                data-testid="cta-create-profile-btn"
              >
                Crear mi perfil ahora
              </Button>
            </div>
          </section>
        </>
      ) : (
        /* Profile Creation Form */
        <div className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="mb-4"
                data-testid="back-to-talent-btn"
              >
                ← Volver
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Crea tu perfil
              </h1>
              <p className="text-gray-600">
                Completa tu información para empezar a recibir oportunidades
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
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
                    <Label className="text-base font-medium mb-4 block">Rol *</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {roles.map((role) => (
                        <Card
                          key={role.value}
                          className={`cursor-pointer transition-all ${formData.rol === role.value ? 'ring-2 ring-orange-500 border-orange-300' : 'hover:shadow-md'}`}
                          onClick={() => updateFormData('rol', role.value)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl mb-2">{role.icon}</div>
                            <h3 className="font-medium">{role.label}</h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {formData.rol === 'jugador' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="posicion">Posición</Label>
                        <Select value={formData.posicion} onValueChange={(value) => updateFormData('posicion', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona posición" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((position) => (
                              <SelectItem key={position} value={position}>{position}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="altura">Altura (cm)</Label>
                        <Input
                          id="altura"
                          type="number"
                          placeholder="180"
                          value={formData.altura}
                          onChange={(e) => updateFormData('altura', e.target.value)}
                          data-testid="altura-input"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Select value={formData.ciudad} onValueChange={(value) => updateFormData('ciudad', value)}>
                      <SelectTrigger data-testid="ciudad-select">
                        <SelectValue placeholder="Selecciona tu ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      placeholder="Cuéntanos sobre ti, tu experiencia, logros..."
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      rows={4}
                      data-testid="bio-textarea"
                    />
                  </div>

                  <div>
                    <Label htmlFor="highlights_url">Enlace a highlights (opcional)</Label>
                    <Input
                      id="highlights_url"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.highlights_url}
                      onChange={(e) => updateFormData('highlights_url', e.target.value)}
                      data-testid="highlights-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="foto">Foto de perfil (URL)</Label>
                    <Input
                      id="foto"
                      type="url"
                      placeholder="https://..."
                      value={formData.foto}
                      onChange={(e) => updateFormData('foto', e.target.value)}
                      data-testid="foto-input"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disponibilidad"
                      checked={formData.disponibilidad_viajar}
                      onCheckedChange={(checked) => updateFormData('disponibilidad_viajar', checked)}
                      data-testid="disponibilidad-checkbox"
                    />
                    <Label htmlFor="disponibilidad">
                      Disponible para viajar/mudarse
                    </Label>
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    data-testid="create-profile-submit-btn"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Crear perfil
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Talent;