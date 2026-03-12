'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const defaultFormData = {
  legalName: '',
  commercialName: '',
  entityType: 'club',
  city: '',
  description: '',
  logo: '',
  website: '',
  instagramUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  youtubeUrl: ''
}

export default function EditClubProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState(defaultFormData)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user.role !== 'club' && session?.user.role !== 'agencia') {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/club-agency/profile')

      if (response.status === 404) {
        setFetching(false)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar el perfil')
      }

      setFormData({
        legalName: data.legalName || '',
        commercialName: data.commercialName || '',
        entityType: data.entityType || 'club',
        city: data.city || '',
        description: data.description || '',
        logo: data.logo || '',
        website: data.website || '',
        instagramUrl: data.instagramUrl || '',
        twitterUrl: data.twitterUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        youtubeUrl: data.youtubeUrl || ''
      })
    } catch (error) {
      console.error('Error loading club profile:', error)
      toast.error('No se pudo cargar el perfil')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.legalName.trim()) {
      toast.error('El nombre legal es obligatorio')
      return
    }

    if (!formData.city.trim()) {
      toast.error('La ciudad es obligatoria')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/club-agency/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          legalName: formData.legalName,
          commercialName: formData.commercialName || null,
          entityType: formData.entityType,
          city: formData.city,
          description: formData.description || null,
          logo: formData.logo || null,
          website: formData.website || null,
          instagramUrl: formData.instagramUrl || null,
          twitterUrl: formData.twitterUrl || null,
          linkedinUrl: formData.linkedinUrl || null,
          youtubeUrl: formData.youtubeUrl || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el perfil')
      }

      toast.success('Perfil actualizado correctamente')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-workhoops-accent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Editar perfil de club</h1>
        <p className="text-gray-600 mt-2 mb-8">
          Esta información se mostrará en tu página pública del club.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información principal</CardTitle>
              <CardDescription>Datos básicos visibles en tu página pública.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalName">Nombre legal *</Label>
                  <Input
                    id="legalName"
                    value={formData.legalName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="commercialName">Nombre comercial</Label>
                  <Input
                    id="commercialName"
                    value={formData.commercialName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, commercialName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entityType">Tipo de entidad *</Label>
                  <Select value={formData.entityType} onValueChange={(value) => setFormData((prev) => ({ ...prev, entityType: value }))}>
                    <SelectTrigger id="entityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">Club</SelectItem>
                      <SelectItem value="agencia">Agencia</SelectItem>
                      <SelectItem value="academia">Academia</SelectItem>
                      <SelectItem value="programa_universitario">Programa universitario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu club, proyecto deportivo y objetivos de reclutamiento."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes y enlaces</CardTitle>
              <CardDescription>Opcional, para mejorar visibilidad de tu club.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUrl">X / Twitter</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, twitterUrl: e.target.value }))}
                    placeholder="https://x.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="youtubeUrl">YouTube</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="bg-workhoops-accent hover:bg-orange-600" disabled={loading}>
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
            <Link href="/dashboard">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
