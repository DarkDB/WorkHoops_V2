'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, X, Building2, MapPin, Users, Award, Globe, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function EditClubAgencyProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'club',
    foundedYear: new Date().getFullYear(),
    description: '',
    logo: '',
    coverImage: '',
    country: 'España',
    city: '',
    address: '',
    categories: [] as string[],
    divisions: [] as string[],
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    facilities: '',
    achievements: '',
    isPublic: true
  })

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([])

  const availableCategories = ['Base', 'Junior', 'Senior', 'Veteranos', 'Femenino', 'Masculino']
  const availableDivisions = ['ACB', 'LEB Oro', 'LEB Plata', 'EBA', 'Liga Femenina', 'Liga Femenina 2', 'Primera Nacional', 'Segunda Nacional']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'club' && session?.user?.role !== 'agencia') {
      toast.error('Acceso denegado', {
        description: 'Solo clubs y agencias pueden acceder a esta página'
      })
      router.push('/dashboard')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/club-agency/profile')
      
      if (response.status === 404) {
        // Profile doesn't exist yet - that's okay
        setFetching(false)
        return
      }

      if (!response.ok) {
        throw new Error('Error al cargar el perfil')
      }

      const data = await response.json()
      
      setFormData({
        organizationName: data.organizationName || '',
        organizationType: data.organizationType || 'club',
        foundedYear: data.foundedYear || new Date().getFullYear(),
        description: data.description || '',
        logo: data.logo || '',
        coverImage: data.coverImage || '',
        country: data.country || 'España',
        city: data.city || '',
        address: data.address || '',
        categories: data.categories || [],
        divisions: data.divisions || [],
        contactPerson: data.contactPerson || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        website: data.website || '',
        facebookUrl: data.facebookUrl || '',
        twitterUrl: data.twitterUrl || '',
        instagramUrl: data.instagramUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        facilities: data.facilities || '',
        achievements: data.achievements || '',
        isPublic: data.isPublic !== undefined ? data.isPublic : true
      })

      setSelectedCategories(data.categories || [])
      setSelectedDivisions(data.divisions || [])
      
      setFetching(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Error', {
        description: 'No se pudo cargar el perfil'
      })
      setFetching(false)
    }
  }

  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(updated)
    setFormData({ ...formData, categories: updated })
  }

  const toggleDivision = (division: string) => {
    const updated = selectedDivisions.includes(division)
      ? selectedDivisions.filter(d => d !== division)
      : [...selectedDivisions, division]
    
    setSelectedDivisions(updated)
    setFormData({ ...formData, divisions: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.organizationName.trim()) {
      toast.error('Error', { description: 'El nombre de la organización es requerido' })
      return
    }

    if (!formData.city.trim()) {
      toast.error('Error', { description: 'La ciudad es requerida' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/club-agency/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el perfil')
      }

      toast.success('¡Perfil guardado!', {
        description: data.message
      })

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al guardar el perfil'
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
          <h1 className="text-3xl font-bold text-gray-900">Editar perfil de organización</h1>
          <p className="text-gray-600 mt-2">Completa la información de tu club o agencia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Información básica</span>
              </CardTitle>
              <CardDescription>Datos principales de tu organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Nombre de la organización *</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="CB Madrid"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="organizationType">Tipo de organización *</Label>
                  <Select 
                    value={formData.organizationType}
                    onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">Club</SelectItem>
                      <SelectItem value="agencia">Agencia</SelectItem>
                      <SelectItem value="escuela">Escuela</SelectItem>
                      <SelectItem value="federacion">Federación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="foundedYear">Año de fundación</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu organización, historia, valores..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Ubicación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Madrid"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección completa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle Example, 123"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorías y Divisiones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Categorías y Divisiones</span>
              </CardTitle>
              <CardDescription>Selecciona las categorías y divisiones que manejas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Categorías</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableCategories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Divisiones</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableDivisions.map((division) => (
                    <Button
                      key={division}
                      type="button"
                      variant={selectedDivisions.includes(division) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDivision(division)}
                    >
                      {division}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Información de contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPerson">Persona de contacto</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email de contacto</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contacto@club.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Presencia online</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.tuclub.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/tuclub"
                  />
                </div>

                <div>
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/tuclub"
                  />
                </div>

                <div>
                  <Label htmlFor="twitterUrl">Twitter/X</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/tuclub"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/tuclub"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Información adicional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facilities">Instalaciones</Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="Describe las instalaciones disponibles..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="achievements">Logros destacados</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="Campeonatos, reconocimientos, hitos importantes..."
                  rows={3}
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
                  Guardar perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
