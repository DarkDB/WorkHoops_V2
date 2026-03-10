'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowRight, MapPin, Trash2 } from 'lucide-react'

type PipelineStatus = 'SAVED' | 'CONTACTED' | 'INVITED' | 'SIGNED' | 'REJECTED'

interface ShortlistItem {
  id: string
  talentProfileId: string
  status: PipelineStatus
  updatedAt: string
  talentProfile: {
    id: string
    fullName: string
    city: string
    country: string
    position: string | null
    currentLevel: string | null
    availabilityStatus: 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE' | null
  }
}

interface ClubShortlistManagerProps {
  initialItems: ShortlistItem[]
}

const statusLabel: Record<PipelineStatus, string> = {
  SAVED: 'Guardado',
  CONTACTED: 'Contactado',
  INVITED: 'Invitado',
  SIGNED: 'Fichado',
  REJECTED: 'Descartado'
}

export default function ClubShortlistManager({ initialItems }: ClubShortlistManagerProps) {
  const [items, setItems] = useState<ShortlistItem[]>(initialItems)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const handleStatusUpdate = async (profileId: string, status: PipelineStatus) => {
    setLoadingKey(`status-${profileId}`)
    try {
      const response = await fetch('/api/talent/shortlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, status })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'No se pudo actualizar el estado')

      setItems((prev) =>
        prev.map((item) => (item.talentProfileId === profileId ? { ...item, status } : item))
      )
      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado'
      })
    } finally {
      setLoadingKey(null)
    }
  }

  const handleRemove = async (profileId: string) => {
    setLoadingKey(`remove-${profileId}`)
    try {
      const response = await fetch('/api/talent/shortlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'No se pudo eliminar')

      setItems((prev) => prev.filter((item) => item.talentProfileId !== profileId))
      toast.success('Jugador eliminado de shortlist')
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo eliminar'
      })
    } finally {
      setLoadingKey(null)
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu shortlist está vacía</h3>
          <p className="text-gray-600 mb-6">
            Guarda jugadores desde el buscador para empezar tu pipeline de scouting.
          </p>
          <Link href="/talento/perfiles">
            <Button>Buscar jugadores</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{item.talentProfile.fullName}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.talentProfile.city}, {item.talentProfile.country}
                  </span>
                  {item.talentProfile.position && <span>{item.talentProfile.position}</span>}
                  {item.talentProfile.currentLevel && <span>{item.talentProfile.currentLevel}</span>}
                </div>
                <div className="mt-2">
                  <Badge variant="secondary">Estado actual: {statusLabel[item.status]}</Badge>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <Select
                  value={item.status}
                  onValueChange={(value: PipelineStatus) => handleStatusUpdate(item.talentProfileId, value)}
                  disabled={loadingKey === `status-${item.talentProfileId}`}
                >
                  <SelectTrigger className="w-full md:w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVED">Guardado</SelectItem>
                    <SelectItem value="CONTACTED">Contactado</SelectItem>
                    <SelectItem value="INVITED">Invitado</SelectItem>
                    <SelectItem value="SIGNED">Fichado</SelectItem>
                    <SelectItem value="REJECTED">Descartado</SelectItem>
                  </SelectContent>
                </Select>

                <Link href={`/talento/perfiles/${item.talentProfile.id}`}>
                  <Button variant="outline" className="w-full md:w-auto">
                    Ver perfil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemove(item.talentProfileId)}
                  disabled={loadingKey === `remove-${item.talentProfileId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
