'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type Frequency = 'immediate' | 'daily' | 'weekly'

interface Preference {
  id?: string
  category: string
  enabled: boolean
  frequency: Frequency
}

const CATEGORIES: { key: string; title: string; description: string; defaultFrequency: Frequency }[] = [
  { key: 'onboarding', title: 'Onboarding', description: 'Bienvenida y guías de primeros pasos.', defaultFrequency: 'immediate' },
  { key: 'club_recruiting', title: 'Actividad de reclutamiento (club)', description: 'Nuevos leads y actividad directa de captación.', defaultFrequency: 'immediate' },
  { key: 'club_digest', title: 'Resumen club', description: 'Resumen semanal de pendientes de reclutamiento.', defaultFrequency: 'weekly' },
  { key: 'talent_recruiting', title: 'Invitaciones de clubes', description: 'Invitaciones y contactos sobre tu perfil.', defaultFrequency: 'immediate' },
  { key: 'club_nudges', title: 'Recordatorios de club', description: 'Recordatorios automáticos de tareas pendientes.', defaultFrequency: 'daily' },
  { key: 'talent_nudges', title: 'Recordatorios de talento', description: 'Recordatorios para responder invitaciones.', defaultFrequency: 'daily' },
  { key: 'product_updates', title: 'Novedades de producto', description: 'Nuevas funcionalidades y mejoras.', defaultFrequency: 'weekly' }
]

export default function EmailPreferencesManager() {
  const [loading, setLoading] = useState(true)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Record<string, Preference>>({})

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/user/email-preferences')
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar')

        const mapped: Record<string, Preference> = {}
        for (const category of CATEGORIES) {
          const existing = (data.preferences || []).find((p: Preference) => p.category === category.key)
          mapped[category.key] = existing || {
            category: category.key,
            enabled: true,
            frequency: category.defaultFrequency
          }
        }
        setPreferences(mapped)
      } catch (error) {
        toast.error('No se pudieron cargar tus preferencias')
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const updatePreference = async (category: string, patch: Partial<Preference>) => {
    const current = preferences[category]
    if (!current) return

    const next: Preference = {
      ...current,
      ...patch
    }

    setUpdatingKey(category)
    setPreferences((prev) => ({ ...prev, [category]: next }))

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          enabled: next.enabled,
          frequency: next.frequency
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'No se pudo guardar')
      toast.success('Preferencia actualizada')
    } catch (error) {
      setPreferences((prev) => ({ ...prev, [category]: current }))
      toast.error('Error al guardar la preferencia')
    } finally {
      setUpdatingKey(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando preferencias...</p>
  }

  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => {
        const pref = preferences[category.key]
        if (!pref) return null

        return (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="text-base">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{category.description}</p>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`pref-${category.key}`} className="text-sm">Activado</Label>
                  <Checkbox
                    id={`pref-${category.key}`}
                    checked={pref.enabled}
                    disabled={updatingKey === category.key}
                    onCheckedChange={(checked) => updatePreference(category.key, { enabled: checked === true })}
                  />
                </div>
              </div>

              <div className="w-full md:w-[180px]">
                <Select
                  value={pref.frequency}
                  onValueChange={(value: Frequency) => updatePreference(category.key, { frequency: value })}
                  disabled={!pref.enabled || updatingKey === category.key}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Inmediato</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
