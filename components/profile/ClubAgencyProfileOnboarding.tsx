'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ClubAgencyProfileOnboardingProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  existingProfile?: any
}

export default function ClubAgencyProfileOnboarding({
  user,
  existingProfile,
}: ClubAgencyProfileOnboardingProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    legalName: existingProfile?.legalName || user?.name || '',
    commercialName: existingProfile?.commercialName || '',
    entityType:
      existingProfile?.entityType ||
      (user?.role === 'agencia' ? 'agencia' : 'club'),
    city: existingProfile?.city || '',
    description: existingProfile?.description || '',
    logo: existingProfile?.logo || '',
  })

  const clubPreviewName = useMemo(
    () => formData.commercialName.trim() || formData.legalName.trim() || 'tu-club',
    [formData.commercialName, formData.legalName]
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.legalName.trim()) {
      toast.error('El nombre del club es obligatorio')
      return
    }

    if (!formData.city.trim()) {
      toast.error('La ciudad es obligatoria')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/club-agency/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legalName: formData.legalName.trim(),
          commercialName: formData.commercialName.trim() || null,
          entityType: formData.entityType,
          city: formData.city.trim(),
          description: formData.description.trim() || null,
          logo: formData.logo.trim() || null,
          contactEmail: user?.email || null,
          isPublic: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el perfil del club')
      }

      toast.success('Perfil básico creado', {
        description: 'Ya puedes usar WorkHoops como club y completar el resto después.',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error saving club onboarding:', error)
      toast.error('No se pudo guardar el perfil', {
        description:
          error instanceof Error ? error.message : 'Inténtalo de nuevo en unos segundos.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="border-workhoops-accent/20 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            <Building className="h-4 w-4" />
            <span>Onboarding rápido para clubes</span>
          </div>
          <div>
            <CardTitle className="text-3xl text-gray-900">Activa tu club en menos de 2 minutos</CardTitle>
            <CardDescription className="mt-2 text-base">
              Solo necesitamos lo mínimo para crear tu página pública y empezar a recibir interés.
              El resto lo podrás completar después desde tu panel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="legalName">Nombre del club *</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, legalName: e.target.value }))
                  }
                  placeholder="Escola Pia Sabadell"
                  required
                />
              </div>

              <div>
                <Label htmlFor="commercialName">Nombre visible</Label>
                <Input
                  id="commercialName"
                  value={formData.commercialName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, commercialName: e.target.value }))
                  }
                  placeholder="Opcional si usas otro nombre público"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="entityType">Tipo de entidad *</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, entityType: value }))
                  }
                >
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Sabadell"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Explica brevemente quiénes sois, vuestro proyecto deportivo y qué tipo de jugador buscáis."
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, logo: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Vista previa de la URL pública</p>
              <p className="mt-1">
                Se generará automáticamente a partir del nombre del club. Si vienes de un slug
                provisional como <code>club-3</code>, se corregirá al guardar.
              </p>
              <p className="mt-2 font-medium text-workhoops-accent">/club/{clubPreviewName}</p>
            </div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Después podrás añadir redes, web, contacto y más detalle en la edición del perfil.
              </p>
              <Button type="submit" disabled={saving} className="sm:min-w-[220px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Crear página del club
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
