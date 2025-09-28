import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CheckCircle, Building, Users, Mail, ExternalLink, Calendar, Tag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const OpportunityDetail = () => {
  const { slug } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
    cv_url: ''
  });

  useEffect(() => {
    if (slug) {
      fetchOpportunityDetails();
    }
  }, [slug]);

  const fetchOpportunityDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/opportunities/slug/${slug}`);
      const opp = response.data;
      setOpportunity(opp);
      
      // Fetch organization details
      if (opp.organizacion_id) {
        const orgResponse = await axios.get(`${BACKEND_URL}/api/organizations/${opp.organizacion_id}`);
        setOrganization(orgResponse.data);
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      toast.error('No se pudo cargar la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically send the application to your backend
      toast.success('Aplicación enviada correctamente. Te contactaremos pronto.');
      setShowApplyModal(false);
      setApplicationData({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: '',
        cv_url: ''
      });
    } catch (error) {
      toast.error('Error al enviar la aplicación');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: opportunity.titulo,
        text: `Mira esta oportunidad en WorkHoops: ${opportunity.titulo}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidad no encontrada</h1>
            <p className="text-gray-600 mb-6">La oportunidad que buscas no existe o ha sido eliminada.</p>
            <Link to="/oportunidades">
              <Button>Volver a oportunidades</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="opportunity-detail-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/oportunidades" className="hover:text-orange-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Oportunidades
          </Link>
          <span>/</span>
          <span className="text-gray-900">{opportunity.titulo}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge className={getTypeColor(opportunity.tipo)}>
                      {getOpportunityTypeLabel(opportunity.tipo)}
                    </Badge>
                    {opportunity.verificacion && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Verificado</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    data-testid="share-opportunity"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="opportunity-title">
                  {opportunity.titulo}
                </h1>

                <p className="text-lg text-gray-600 font-medium mb-4">
                  {opportunity.organizacion_nombre}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {opportunity.ubicacion}
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {opportunity.modalidad}
                  </div>
                  {opportunity.fecha_limite && (
                    <div className="flex items-center text-orange-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Hasta {new Date(opportunity.fecha_limite).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {opportunity.remuneracion && (
                  <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium mb-4">
                    {opportunity.remuneracion}
                  </div>
                )}

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {opportunity.descripcion.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requisitos && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {opportunity.requisitos.split('\n').map((requirement, index) => (
                      <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                        {requirement}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {opportunity.beneficios && (
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {opportunity.beneficios.split('\n').map((benefit, index) => (
                      <p key={index} className="mb-2 text-gray-700 leading-relaxed">
                        {benefit}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Aplicar a esta oportunidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.cupos && (
                  <div className="text-sm text-gray-600">
                    <strong>Plazas disponibles:</strong> {opportunity.cupos}
                  </div>
                )}
                
                {opportunity.enlace_externo ? (
                  <a
                    href={opportunity.enlace_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="external-apply-btn">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Aplicar en sitio externo
                    </Button>
                  </a>
                ) : (
                  <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="apply-btn">
                        Aplicar ahora
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Aplicar a {opportunity.titulo}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleApply} className="space-y-4">
                        <div>
                          <Label htmlFor="nombre">Nombre completo *</Label>
                          <Input
                            id="nombre"
                            value={applicationData.nombre}
                            onChange={(e) => setApplicationData(prev => ({...prev, nombre: e.target.value}))}
                            required
                            data-testid="apply-name-input"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={applicationData.email}
                            onChange={(e) => setApplicationData(prev => ({...prev, email: e.target.value}))}
                            required
                            data-testid="apply-email-input"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={applicationData.telefono}
                            onChange={(e) => setApplicationData(prev => ({...prev, telefono: e.target.value}))}
                            data-testid="apply-phone-input"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cv_url">Enlace a CV o perfil</Label>
                          <Input
                            id="cv_url"
                            type="url"
                            placeholder="https://..."
                            value={applicationData.cv_url}
                            onChange={(e) => setApplicationData(prev => ({...prev, cv_url: e.target.value}))}
                            data-testid="apply-cv-input"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="mensaje">Mensaje personal</Label>
                          <Textarea
                            id="mensaje"
                            placeholder="Cuéntanos por qué eres el candidato ideal..."
                            value={applicationData.mensaje}
                            onChange={(e) => setApplicationData(prev => ({...prev, mensaje: e.target.value}))}
                            rows={4}
                            data-testid="apply-message-input"
                          />
                        </div>
                        
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" data-testid="submit-application">
                          Enviar aplicación
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="text-sm text-gray-500">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Contacto: {opportunity.contacto}
                </div>
              </CardContent>
            </Card>

            {/* Organization info */}
            {organization && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre {organization.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  {organization.logo && (
                    <div className="mb-4">
                      <img
                        src={organization.logo}
                        alt={organization.nombre}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {organization.bio && (
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {organization.bio}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {organization.web && (
                      <a
                        href={organization.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Sitio web
                      </a>
                    )}
                    
                    {organization.verificada && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Organización verificada</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick info */}
            <Card>
              <CardHeader>
                <CardTitle>Información rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium capitalize">{opportunity.nivel}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Modalidad:</span>
                  <span className="font-medium capitalize">{opportunity.modalidad}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Publicado:</span>
                  <span className="font-medium">
                    {new Date(opportunity.fecha_publicacion).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                {opportunity.fecha_limite && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha límite:</span>
                    <span className="font-medium text-orange-600">
                      {new Date(opportunity.fecha_limite).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;