'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface EditOpportunityPageProps {
  params: {
    id: string
  }
}

export default function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    level: '',
    description: '',
    city: '',
    country: 'España',
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

  const types = [
    { value: 'empleo', label: 'Empleo' },
    { value: 'prueba', label: 'Prueba' },
    { value: 'torneo', label: 'Torneo' },
    { value: 'campus', label: 'Campus' }
  ]

  const levels = [
    { value: 'profesional', label: 'Profesional' },
    { value: 'semipro', label: 'Semi-profesional' },
    { value: 'amateur', label: 'Amateur' },
    { value: 'juvenil', label: 'Juvenil' },
    { value: 'infantil', label: 'Infantil' }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'club' && session?.user?.role !== 'agencia') {
      toast.error('Acceso denegado', {
        description: 'Solo clubs y agencias pueden editar ofertas'
      })
      router.push('/dashboard')
      return
    }

    fetchOpportunity()
  }, [session, status, params.id, router])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Oferta no encontrada')
      }

      const data = await response.json()
      
      // Check if user owns this opportunity
      if (data.authorId !== session?.user?.id) {
        toast.error('Acceso denegado', {
          description: 'Solo puedes editar tus propias ofertas'
        })
        router.push('/dashboard')
        return
      }

      setFormData({
        title: data.title || '',
        type: data.type || '',
        level: data.level || '',
        description: data.description || '',
        city: data.city || '',
        country: data.country || 'España',
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        remunerationType: data.remunerationType || 'mensual',
        remunerationMin: data.remunerationMin || '',
        remunerationMax: data.remunerationMax || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        applicationUrl: data.applicationUrl || '',
        benefits: data.benefits || ''
      })

      setFetching(false)
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      toast.error('Error', {
        description: 'No se pudo cargar la oferta'
      })
      router.push('/dashboard')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validations
    if (!formData.title.trim() || !formData.type || !formData.level || !formData.description.trim()) {
      toast.error('Error', { description: 'Por favor completa todos los campos requeridos' })
      return
    }

    if (formData.description.length < 50) {
      toast.error('Error', { description: 'La descripción debe tener al menos 50 caracteres' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/opportunities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la oferta')
      }

      toast.success('¡Oferta actualizada!', {
        description: 'Los cambios han sido guardados correctamente'
      })

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Error updating opportunity:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al actualizar la oferta'
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-workhoops-accent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar oferta</h1>
          <p className="text-gray-600 mt-2">Actualiza la información de tu oportunidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la oferta *</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Base para equipo de LEB Plata"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Tipo de oportunidad *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Nivel *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
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
                <Label htmlFor="description">Descripción *</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe la oportunidad, requisitos, responsabilidades..."
                  className="mt-1"
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mínimo 50 caracteres ({formData.description.length}/50)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Fechas */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación y fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input 
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Barcelona"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">País</Label>
                  <Input 
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Fecha límite de inscripción</Label>
                  <Input 
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remuneración */}
          <Card>
            <CardHeader>
              <CardTitle>Remuneración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="remunerationMin">Mínimo (€)</Label>
                  <Input 
                    id="remunerationMin"
                    type="number"
                    value={formData.remunerationMin}
                    onChange={(e) => handleInputChange('remunerationMin', e.target.value)}
                    placeholder="1000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="remunerationMax">Máximo (€)</Label>
                  <Input 
                    id="remunerationMax"
                    type="number"
                    value={formData.remunerationMax}
                    onChange={(e) => handleInputChange('remunerationMax', e.target.value)}
                    placeholder="2000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="remunerationType">Periodo</Label>
                  <Select value={formData.remunerationType} onValueChange={(value) => handleInputChange('remunerationType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="por_partido">Por partido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="benefits">Beneficios ofrecidos</Label>
                <Textarea 
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  placeholder="Material deportivo, formación, oportunidades de crecimiento..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail">Email de contacto *</Label>
                  <Input 
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="contacto@club.com"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                  <Input 
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+34 600 000 000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="applicationUrl">URL de inscripción (opcional)</Label>
                <Input 
                  id="applicationUrl"
                  type="url"
                  value={formData.applicationUrl}
                  onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
                  placeholder="https://tuclub.com/inscripcion"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </Link>

            <Button type="submit" disabled={loading} className="bg-workhoops-accent hover:bg-orange-600">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
