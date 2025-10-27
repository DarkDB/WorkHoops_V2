'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Upload, MapPin, Users, Euro, Calendar, FileText, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { toast } from 'sonner'

const opportunityTypes = [
  { value: 'empleo', label: 'Empleo', description: 'Posición profesional permanente o temporal' },
  { value: 'prueba', label: 'Prueba', description: 'Tryout o selección de jugadores' },
  { value: 'torneo', label: 'Torneo', description: 'Competición o evento deportivo' },
  { value: 'clinica', label: 'Clínica', description: 'Campus o formación deportiva' },
  { value: 'campus', label: 'Campus', description: 'Campus deportivo o entrenamiento intensivo' },
  { value: 'beca', label: 'Beca', description: 'Oportunidad de estudios con baloncesto' },
  { value: 'patrocinio', label: 'Patrocinio', description: 'Apoyo económico o material' }
]

const levels = [
  // Profesional
  { value: 'acb', label: 'ACB - Liga Endesa', description: 'Primera división profesional' },
  { value: 'primera_feb', label: 'Primera FEB (LEB Oro)', description: 'Segunda división nacional' },
  { value: 'segunda_feb', label: 'Segunda FEB (LEB Plata)', description: 'Tercera división nacional' },
  { value: 'tercera_feb', label: 'Tercera FEB (EBA)', description: 'Cuarta división nacional' },
  
  // Autonómicas
  { value: 'autonomica', label: '1ª División Autonómica', description: 'Ligas regionales' },
  { value: 'provincial', label: 'Liga Provincial', description: 'Competiciones provinciales' },
  
  // Formación
  { value: 'cantera', label: 'Cantera / Formación', description: 'Categorías base (Mini, Infantil, Cadete, Junior)' },
  
  // General
  { value: 'amateur', label: 'Amateur / Recreativo', description: 'Nivel no federado' }
]

const positions = [
  'Base (Point Guard)',
  'Escolta (Shooting Guard)', 
  'Alero (Small Forward)',
  'Ala-Pívot (Power Forward)',
  'Pívot (Center)',
  'Entrenador/a',
  'Entrenador/a Asistente',
  'Preparador Físico',
  'Fisioterapeuta',
  'Árbitro/a',
  'Directivo/a',
  'Marketing/Comunicación'
]

export default function PublicarPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [opportunitiesCount, setOpportunitiesCount] = useState(0)
  const [isLoadingPlan, setIsLoadingPlan] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    level: '',
    description: '',
    city: '',
    country: 'España',
    positions: [] as string[],
    deadline: '',
    startDate: '',
    remunerationType: 'mensual',
    remunerationMin: '',
    remunerationMax: '',
    contactEmail: '',
    contactPhone: '',
    applicationUrl: '',
    benefits: ''
  })

  // Fetch user plan and opportunities count
  useEffect(() => {
    if (session?.user) {
      // Usar la sesión directamente para obtener el planType
      setUserPlan((session.user as any).planType || 'free_amateur')
      
      // Obtener el conteo de ofertas
      fetch('/api/user/opportunities-count')
        .then(res => res.json())
        .then(data => {
          setOpportunitiesCount(data.count || 0)
        })
        .catch(err => console.error('Error fetching opportunities count:', err))
        .finally(() => setIsLoadingPlan(false))
    } else {
      setIsLoadingPlan(false)
    }
  }, [session])

  // Determinar si el usuario tiene plan premium
  const freePlans = ['free_amateur', 'gratis', 'free', null]
  const hasPremiumPlan = !freePlans.includes(userPlan)
  const maxOpportunities = hasPremiumPlan ? 3 : 1
  const remainingOpportunities = maxOpportunities - opportunitiesCount

  // Check if user is logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-workhoops-accent" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Regístrate para publicar
              </h2>
              <p className="text-gray-600 mb-6">
                Necesitas una cuenta de Club o Agencia para publicar ofertas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?role=club">
                  <Button size="lg">
                    Registrarse como Club
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check if user is club or agency
  if (session.user.role !== 'club' && session.user.role !== 'agencia') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-orange-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Solo Clubs y Agencias pueden publicar
              </h2>
              <p className="text-gray-600 mb-6">
                Tu cuenta actual es de tipo "{session.user.role}". Solo los Clubs y Agencias pueden publicar ofertas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button variant="outline">
                    Ir al Dashboard
                  </Button>
                </Link>
                <Link href="/oportunidades">
                  <Button>
                    Ver Oportunidades
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent, featured: boolean = false) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // If featured, redirect to Stripe payment
      if (featured) {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planType: 'destacado',
            returnUrl: window.location.origin
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error al crear sesión de pago')
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          // Save form data to sessionStorage before redirecting
          sessionStorage.setItem('pendingOpportunity', JSON.stringify(formData))
          window.location.href = data.url
        }
        return
      }

      // Regular submission (free)
      // Prepare data without fields not in schema
      const { positions, ...opportunityData } = formData
      
      const payload = {
        ...opportunityData,
        featured: false
      }
      
      console.log('Sending opportunity data:', payload)
      
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!response.ok) {
        console.error('API error:', data)
        throw new Error(data.details ? data.details.join(', ') : data.message || 'Error al crear oportunidad')
      }

      toast.success('¡Oportunidad creada!', {
        description: 'Tu oferta está pendiente de revisión por el administrador. Te notificaremos cuando sea aprobada.'
      })

      router.push('/dashboard')
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al publicar oferta'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Publicar una oportunidad
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra el talento que necesitas para tu equipo u organización
          </p>
        </div>

        {/* Upsell Plans */}
        <Card className="mb-8 border-workhoops-accent bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-workhoops-accent" />
              <span>Aumenta la visibilidad de tu oferta</span>
            </CardTitle>
            <CardDescription>
              Las ofertas destacadas reciben 5x más candidatos qualificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Badge className="mb-2">Gratis</Badge>
                <h3 className="font-medium">Publicación básica</h3>
                <p className="text-sm text-gray-600">Aparece en listados generales</p>
              </div>
              <div className="flex-1 bg-white rounded-lg p-4 border-2 border-workhoops-accent">
                <Badge className="mb-2 bg-workhoops-accent">Destacado - 49€</Badge>
                <h3 className="font-medium">Publicación destacada</h3>
                <p className="text-sm text-gray-600">
                  • Posición premium por 60 días<br/>
                  • Promoción en redes sociales<br/>
                  • Soporte prioritario
                </p>
                <Button size="sm" className="mt-2 w-full">
                  Seleccionar destacado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <form className="space-y-8" onSubmit={(e) => handleSubmit(e, false)}>
          {/* Tipo de Oportunidad */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de oportunidad *</CardTitle>
              <CardDescription>
                Selecciona la categoría que mejor describe tu oferta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunityTypes.map((type) => (
                  <div 
                    key={type.value}
                    onClick={() => handleInputChange('type', type.value)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.type === type.value 
                        ? 'border-workhoops-accent bg-orange-50' 
                        : 'border-gray-200 hover:border-workhoops-accent hover:bg-orange-50'
                    }`}
                  >
                    <h3 className="font-medium mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Título de la oportunidad *</Label>
                  <Input 
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="ej. Entrenador/a Base para Liga EBA"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="level">Nivel *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Barcelona"
                      className="pl-10 mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">País *</Label>
                  <Input 
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="España"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="positions">Posiciones buscadas</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona las posiciones" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position.toLowerCase()}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción de la oportunidad</CardTitle>
              <CardDescription>
                Proporciona detalles completos para atraer a los mejores candidatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe la oportunidad, responsabilidades, objetivos del equipo..."
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="benefits">Beneficios ofrecidos</Label>
                <Textarea 
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  placeholder="Remuneración, material deportivo, formación, oportunidades de crecimiento..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fechas y Remuneración */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas y condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="deadline">Fecha límite de aplicación</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      type="date"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="startDate">Fecha de inicio (opcional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      type="date"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="remunerationMin">Remuneración mínima (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="remunerationMin"
                      value={formData.remunerationMin}
                      onChange={(e) => handleInputChange('remunerationMin', e.target.value)}
                      type="number"
                      placeholder="800"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remunerationMax">Remuneración máxima (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="remunerationMax"
                      value={formData.remunerationMax}
                      onChange={(e) => handleInputChange('remunerationMax', e.target.value)}
                      type="number"
                      placeholder="1200"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
              <CardDescription>
                Los candidatos podrán contactar directamente contigo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail">Email de contacto *</Label>
                  <Input 
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    type="email"
                    placeholder="contacto@miclub.es"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Teléfono (opcional)</Label>
                  <Input 
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    type="tel"
                    placeholder="+34 600 000 000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="applicationUrl">URL externa de aplicación (opcional)</Label>
                <Input 
                  id="applicationUrl"
                  value={formData.applicationUrl}
                  onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
                  type="url"
                  placeholder="https://www.miclub.es/aplica"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si prefieres que apliquen por tu web, añade el enlace aquí
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Publicación */}
          <Card className="border-workhoops-accent/30 bg-orange-50/30">
            <CardHeader>
              <CardTitle>Opciones de publicación</CardTitle>
              <CardDescription>
                Elige cómo quieres publicar tu oferta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Si el usuario tiene plan premium, mostrar un solo botón */}
              {hasPremiumPlan ? (
                <div className="md:col-span-2">
                  <Card className="border-2 border-workhoops-accent">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl">Tu Plan Premium</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {remainingOpportunities > 0 
                              ? `Te quedan ${remainingOpportunities} de ${maxOpportunities} ofertas disponibles`
                              : 'Has usado todas tus ofertas disponibles'}
                          </p>
                        </div>
                        <Badge className="bg-workhoops-accent">
                          {opportunitiesCount}/{maxOpportunities} usadas
                        </Badge>
                      </div>
                      
                      {remainingOpportunities > 0 ? (
                        <>
                          <ul className="space-y-2 mb-6 text-sm text-gray-600">
                            <li className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                              Visibilidad prioritaria
                            </li>
                            <li className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                              Badge "Destacado"
                            </li>
                            <li className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                              Mayor alcance y respuestas
                            </li>
                          </ul>
                          <Button 
                            type="submit"
                            className="w-full bg-workhoops-accent hover:bg-orange-600 text-lg py-6"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Publicando...' : `Publicar Oferta (${remainingOpportunities} disponibles)`}
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-4">
                            Has alcanzado el límite de ofertas de tu plan. Espera a que alguna expire o elimina una existente.
                          </p>
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full">
                              Ver mis ofertas
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Publicación Gratis */}
                  <div className="border-2 rounded-lg p-6 bg-white">
                    <h3 className="font-bold text-xl mb-2">Publicación Gratis</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      €0
                      <span className="text-sm font-normal text-gray-600">/ 30 días</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        Visibilidad estándar
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        Visible por 30 días
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        Solo 1 oferta activa
                      </li>
                    </ul>
                    {opportunitiesCount >= 1 ? (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-600 mb-3">
                          Ya tienes una oferta publicada
                        </p>
                        <Link href="/planes">
                          <Button variant="outline" className="w-full">
                            Actualizar a Premium
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button 
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Publicando...' : 'Publicar Gratis'}
                      </Button>
                    )}
                  </div>

                  {/* Publicación Destacada */}
                  <div className="border-2 border-workhoops-accent rounded-lg p-6 bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-workhoops-accent">Recomendado</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">Pack Destacado</h3>
                      <Badge variant="outline">Hasta 3 ofertas</Badge>
                    </div>
                    <div className="text-3xl font-bold text-workhoops-accent mb-4">
                      €49,90
                      <span className="text-sm font-normal text-gray-600">/ 60 días</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                        Visibilidad prioritaria
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                        Visible por 60 días
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                        Hasta 3 publicaciones
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-workhoops-accent" />
                        Badge "Destacado"
                      </li>
                    </ul>
                    <Link href="/planes">
                      <Button 
                        type="button"
                        className="w-full bg-workhoops-accent hover:bg-orange-600"
                      >
                        Contratar Plan Destacado
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-gray-500 mt-4">
                <p>
                  Al publicar aceptas nuestros{' '}
                  <Link href="/legal/terminos" className="text-workhoops-accent hover:underline">
                    términos de uso
                  </Link>{' '}
                  y{' '}
                  <Link href="/legal/privacidad" className="text-workhoops-accent hover:underline">
                    política de privacidad
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}