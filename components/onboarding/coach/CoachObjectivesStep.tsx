'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Target, Briefcase, Users } from 'lucide-react'

interface CoachObjectivesStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachObjectivesStep({ formData, updateFormData }: CoachObjectivesStepProps) {
  const competencies = [
    { key: 'leadership', label: 'Liderazgo' },
    { key: 'teamwork', label: 'Trabajo en equipo' },
    { key: 'conflictResolution', label: 'Resolución de conflictos' },
    { key: 'organization', label: 'Organización' },
    { key: 'adaptability', label: 'Adaptabilidad' },
    { key: 'innovation', label: 'Innovación' }
  ]

  const updateCompetence = (key: string, value: number) => {
    updateFormData({ [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 6 de 6:</strong> Objetivos y competencias - Define qué buscas
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Target className="w-5 h-5 mr-2 text-workhoops-accent" />
          Objetivo Principal
        </h3>
        <div>
          <Label htmlFor="currentGoal">Tu objetivo actual</Label>
          <Textarea
            id="currentGoal"
            value={formData.currentGoal}
            onChange={(e) => updateFormData({ currentGoal: e.target.value })}
            placeholder="Encontrar equipo profesional en Liga LEB, entrenar fuera de España, colaborar con academias..."
            rows={3}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-workhoops-accent" />
          Tipo de Oferta que Buscas
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="offerType">Rol preferido</Label>
            <Select
              value={formData.offerType}
              onValueChange={(value) => updateFormData({ offerType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primer entrenador">Primer entrenador</SelectItem>
                <SelectItem value="Asistente">Asistente</SelectItem>
                <SelectItem value="Formador individual">Formador individual</SelectItem>
                <SelectItem value="Coach invitado">Coach invitado</SelectItem>
                <SelectItem value="Cualquiera">Abierto a cualquier rol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="availability">Disponibilidad temporal</Label>
            <Select
              value={formData.availability}
              onValueChange={(value) => updateFormData({ availability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿Cuándo estás disponible?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Temporada completa">Temporada completa</SelectItem>
                <SelectItem value="Campus de verano">Campus de verano</SelectItem>
                <SelectItem value="Verano">Solo verano</SelectItem>
                <SelectItem value="Freelance">Freelance / Colaboraciones puntuales</SelectItem>
                <SelectItem value="Inmediata">Disponibilidad inmediata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-workhoops-accent" />
          Competencias Personales
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Evalúa tus competencias personales (1-5)
        </p>
        <div className="space-y-4">
          {competencies.map((comp) => {
            const value = formData[comp.key] || 3
            return (
              <div key={comp.key}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">{comp.label}</Label>
                  <span className="text-sm font-medium text-gray-900">{value}/5</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(vals) => updateCompetence(comp.key, vals[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Biografía (opcional)</h3>
        <div>
          <Label htmlFor="bio">Sobre ti</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            placeholder="Cuéntanos un poco más sobre ti, tu pasión por el baloncesto y qué te hace único como entrenador..."
            rows={4}
          />
        </div>
      </Card>
    </div>
  )
}
