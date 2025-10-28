'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CoachPhilosophyStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachPhilosophyStep({ formData, updateFormData }: CoachPhilosophyStepProps) {
  const playingStyles = [
    'Juego rápido', 'Juego posicional', '5-out', 'Defensa zonal',
    'Defensa individual', 'Pressón', 'Juego interior', 'Juego exterior'
  ]

  const togglePlayingStyle = (style: string) => {
    const current = formData.playingStyle || []
    if (current.includes(style)) {
      updateFormData({ playingStyle: current.filter((s: string) => s !== style) })
    } else {
      updateFormData({ playingStyle: [...current, style] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 4 de 6:</strong> Filosofía y estilo - Define tu enfoque como entrenador
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Estilo de Juego Preferido</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {playingStyles.map((style) => (
            <Badge
              key={style}
              variant={formData.playingStyle?.includes(style) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => togglePlayingStyle(style)}
            >
              {style}
              {formData.playingStyle?.includes(style) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Selecciona los estilos que mejor te definen
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Prioridad de Trabajo</h3>
        <Select
          value={formData.workPriority}
          onValueChange={(value) => updateFormData({ workPriority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="¿Qué priorizas?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Desarrollo individual">Desarrollo individual</SelectItem>
            <SelectItem value="Resultados">Resultados</SelectItem>
            <SelectItem value="Formación integral">Formación integral</SelectItem>
            <SelectItem value="Equilibrio">Equilibrio entre todos</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Tipo de Jugador</h3>
        <div>
          <Label htmlFor="playerTypePreference">Tipo de jugador que más te gusta potenciar</Label>
          <Textarea
            id="playerTypePreference"
            value={formData.playerTypePreference}
            onChange={(e) => updateFormData({ playerTypePreference: e.target.value })}
            placeholder="Jugadores versátiles, bases creadores, especialistas defensivos..."
            rows={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Inspiraciones o Referentes</h3>
        <div>
          <Label htmlFor="inspirations">Entrenadores que te inspiran (opcional)</Label>
          <Textarea
            id="inspirations"
            value={formData.inspirations}
            onChange={(e) => updateFormData({ inspirations: e.target.value })}
            placeholder="Aíto García Reneses, Gregg Popovich, Pablo Laso..."
            rows={2}
          />
        </div>
      </Card>
    </div>
  )
}
