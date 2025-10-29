'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Search } from 'lucide-react'

interface ClubNeedsStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function ClubNeedsStep({ formData, updateFormData }: ClubNeedsStepProps) {
  const profiles = [
    'Base', 'Escolta', 'Alero', 'Ala-pívot', 'Pívot',
    'Entrenador', 'Preparador Físico', 'Analista', 'Fisioterapeuta'
  ]

  const skills = [
    'Tirador', 'Defensor especialista', 'Reboteador', 'Creador de juego',
    'IQ baloncestístico', 'Liderazgo', 'Versátil', 'Atletismo'
  ]

  const toggleItem = (field: string, item: string) => {
    const current = formData[field] || []
    if (current.includes(item)) {
      updateFormData({ [field]: current.filter((i: string) => i !== item) })
    } else {
      updateFormData({ [field]: [...current, item] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 3 de 5:</strong> Necesidades y criterios de fichaje
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Search className="w-5 h-5 mr-2 text-workhoops-accent" />
          Perfiles Buscados
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {profiles.map((profile) => (
            <Badge
              key={profile}
              variant={formData.profilesNeeded?.includes(profile) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem('profilesNeeded', profile)}
            >
              {profile}
              {formData.profilesNeeded?.includes(profile) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Selecciona los perfiles que tu organización busca habitualmente
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Rango de Edad</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageRangeMin">Edad mínima</Label>
            <Input
              id="ageRangeMin"
              type="number"
              min="10"
              max="50"
              value={formData.ageRangeMin}
              onChange={(e) => updateFormData({ ageRangeMin: parseInt(e.target.value) })}
              placeholder="18"
            />
          </div>

          <div>
            <Label htmlFor="ageRangeMax">Edad máxima</Label>
            <Input
              id="ageRangeMax"
              type="number"
              min="10"
              max="50"
              value={formData.ageRangeMax}
              onChange={(e) => updateFormData({ ageRangeMax: parseInt(e.target.value) })}
              placeholder="28"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Experiencia Requerida</h3>
        <Select
          value={formData.experienceRequired}
          onValueChange={(value) => updateFormData({ experienceRequired: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nivel de experiencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Amateur">Amateur</SelectItem>
            <SelectItem value="Semi-profesional">Semi-profesional</SelectItem>
            <SelectItem value="Profesional">Profesional</SelectItem>
            <SelectItem value="Internacional">Internacional</SelectItem>
            <SelectItem value="Cualquiera">Cualquier nivel</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Habilidades Clave</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant={formData.keySkills?.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem('keySkills', skill)}
            >
              {skill}
              {formData.keySkills?.includes(skill) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Requisitos Competitivos</h3>
        <div>
          <Label htmlFor="competitiveReqs">Ligas previas, minutos, rol esperado</Label>
          <Textarea
            id="competitiveReqs"
            value={formData.competitiveReqs}
            onChange={(e) => updateFormData({ competitiveReqs: e.target.value })}
            placeholder="Experiencia en LEB Plata, mínimo 15 minutos por partido..."
            rows={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Disponibilidad Necesaria</h3>
        <Select
          value={formData.availabilityNeeded}
          onValueChange={(value) => updateFormData({ availabilityNeeded: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="¿Cuándo necesitas incorporaciones?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inmediata">Inmediata</SelectItem>
            <SelectItem value="proxima_ventana">Próxima ventana de fichajes</SelectItem>
            <SelectItem value="proxima_temporada">Próxima temporada</SelectItem>
            <SelectItem value="campus">Para campus/verano</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Notas de Scouting</h3>
        <div>
          <Label htmlFor="scoutingNotes">Estilo de juego, cultura, valores del club</Label>
          <Textarea
            id="scoutingNotes"
            value={formData.scoutingNotes}
            onChange={(e) => updateFormData({ scoutingNotes: e.target.value })}
            placeholder="Buscamos jugadores que encajen en nuestro sistema de juego rápido, con buena defensa y mentalidad de equipo..."
            rows={4}
          />
        </div>
      </Card>
    </div>
  )
}
