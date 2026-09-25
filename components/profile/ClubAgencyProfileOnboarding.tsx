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
import { Checkbox } from '@/components/ui/checkbox'
import { getProfileEntityType } from '@/lib/agency-identity'

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
  const isAgency = user?.role === 'agencia'
  const [formData, setFormData] = useState({
    legalName: existingProfile?.legalName || (isAgency ? '' : user?.name || ''),
    commercialName: existingProfile?.commercialName || '',
    entityType:
      getProfileEntityType(user?.role || 'club', existingProfile?.entityType || 'club'),
    city: existingProfile?.city || '',
    description: existingProfile?.description || '',
    logo: existingProfile?.logo || '',
  })
  const [isPublic, setIsPublic] = useState(existingProfile?.isPublic ?? !isAgency)

  const clubPreviewName = useMemo(
    () => formData.commercialName.trim() || formData.legalName.trim() || 'tu-club',
    [formData.commercialName, formData.legalName]
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.legalName.trim()) {
      toast.error(isAgency ? 'El nombre de la agencia es obligatorio' : 'El nombre del club es obligatorio')
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
          entityType: isAgency ? 'agencia' : formData.entityType,
          city: formData.city.trim(),
          description: formData.description.trim() || null,
          logo: formData.logo.trim() || null,
          contactEmail: user?.email || null,
          isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el perfil')
      }

      toast.success('Perfil básico creado', {
        description: isAgency ? 'Ya puedes buscar talento y completar tu agencia después.' : 'Ya puedes usar WorkHoops como club y completar el resto después.',
      })

      router.push(isAgency ? '/dashboard' : '/publicar?onboarding=1')
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
            <span>{isAgency ? 'Onboarding rápido para agencias' : 'Onboarding rápido para clubes'}</span>
          </div>
          <div>
            <CardTitle className="text-3xl text-gray-900">{isAgency ? 'Activa tu agencia en menos de 2 minutos' : 'Activa tu club en menos de 2 minutos'}</CardTitle>
            <CardDescription className="mt-2 text-base">
              {isAgency ? 'Solo necesitamos lo mínimo para crear tu perfil de agencia y empezar a buscar talento.' : 'Solo necesitamos lo mínimo para crear tu página pública y empezar a recibir interés.'}
              El resto lo podrás completar después desde tu panel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="legalName">{isAgency ? 'Nombre de la agencia *' : 'Nombre del club *'}</Label>
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, legalName: e.target.value }))
                  }
                  placeholder={isAgency ? 'CRM Basketball Agency' : 'Escola Pia Sabadell'}
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
                  disabled={isAgency}
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
                placeholder={isAgency ? 'Describe tu agencia y el tipo de talento con el que trabajas.' : 'Ej: Club de baloncesto fundado en 2003 en Sabadell. Competimos en 3ª FEB y buscamos jugadores con perfil competitivo. Cuéntanos vuestra historia aquí — las plazas disponibles las publicáis como ofertas por separado.'}
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

            <div className="flex items-start gap-3 rounded-xl border bg-gray-50 p-4">
              <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} />
              <div>
                <Label htmlFor="isPublic">Publicar mi perfil</Label>
                <p className="mt-1 text-sm text-gray-600">{isAgency ? 'Tu agencia no aparecerá públicamente hasta que actives esta opción.' : 'Tu página de club será visible para otros usuarios si activas esta opción.'}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Vista previa de la URL pública</p>
              <p className="mt-1">
                Se generará automáticamente a partir del nombre {isAgency ? 'de la agencia' : 'del club'}. Si vienes de un slug
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
                    {isAgency ? 'Crear perfil de agencia' : 'Crear página del club'}
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
