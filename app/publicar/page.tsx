'use client'

import { useState } from 'react'
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
  { value: 'beca', label: 'Beca', description: 'Oportunidad de estudios con baloncesto' },
  { value: 'patrocinio', label: 'Patrocinio', description: 'Apoyo económico o material' }
]

const levels = [
  { value: 'amateur', label: 'Amateur' },
  { value: 'semi_pro', label: 'Semi-profesional' },
  { value: 'cantera', label: 'Cantera' },
  { value: 'pro', label: 'Profesional' }
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
    requirements: '',
    benefits: ''
  })

  // Check if user is logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-workhoops-accent" />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
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
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          featured: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear oportunidad')
      }

      toast.success('¡Oportunidad creada!', {
        description: 'Tu oferta ha sido publicada exitosamente'
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
                  <Label htmlFor="level">Nivel *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el nivel" />
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
                  placeholder="Describe la oportunidad, responsabilidades, objetivos del equipo..."
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea 
                  id="requirements"
                  placeholder="Experiencia requerida, formación, disponibilidad..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Beneficios ofrecidos</Label>
                <Textarea 
                  id="benefits"
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
                      type="date"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="remuneration">Remuneración (opcional)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="remuneration" 
                      placeholder="ej. 800-1200€/mes"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="spots">Número de plazas</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      id="spots" 
                      type="number"
                      placeholder="1"
                      min="1"
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
                    type="tel"
                    placeholder="+34 600 000 000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Web o redes sociales (opcional)</Label>
                <Input 
                  id="website" 
                  type="url"
                  placeholder="https://www.miclub.es"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Verificación y RGPD */}
          <Card>
            <CardHeader>
              <CardTitle>Verificación y consentimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="verification" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="verification" className="text-sm font-medium">
                    Solicitar verificación de organización
                  </Label>
                  <p className="text-xs text-gray-500">
                    Subir documento oficial para mostrar insignia de "Verificado" (opcional)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" required />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="terms" className="text-sm font-medium">
                    Acepto los términos y condiciones *
                  </Label>
                  <p className="text-xs text-gray-500">
                    He leído y acepto los <Link href="/legal/terminos" className="text-workhoops-accent hover:underline">términos de uso</Link> y la <Link href="/legal/privacidad" className="text-workhoops-accent hover:underline">política de privacidad</Link>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="rgpd" required />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="rgpd" className="text-sm font-medium">
                    Consentimiento RGPD *
                  </Label>
                  <p className="text-xs text-gray-500">
                    Consiento el tratamiento de mis datos personales conforme a la normativa de protección de datos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button type="submit" size="lg" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Publicar oferta gratis
            </Button>
            <Button type="button" size="lg" variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Guardar borrador
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              WorkHoops revisará tu oferta en 24-48h. Te notificaremos por email cuando esté publicada.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}