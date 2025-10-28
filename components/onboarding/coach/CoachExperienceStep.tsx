'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CoachExperienceStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachExperienceStep({ formData, updateFormData }: CoachExperienceStepProps) {
  const categories = [
    'Mini', 'Infantil', 'Cadete', 'Junior', 'Senior',
    'Veteranos', 'Femenino', 'Masculino', 'Profesional'
  ]

  const toggleCategory = (cat: string) => {
    const current = formData.categoriesCoached || []
    if (current.includes(cat)) {
      updateFormData({ categoriesCoached: current.filter((c: string) => c !== cat) })
    } else {
      updateFormData({ categoriesCoached: [...current, cat] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 2 de 6:</strong> Experiencia y trayectoria - Muestra tu credibilidad
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Equipos</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentClub">Club o equipo actual</Label>
            <Input
              id="currentClub"
              value={formData.currentClub}
              onChange={(e) => updateFormData({ currentClub: e.target.value })}
              placeholder="Real Madrid Baloncesto"
            />
          </div>

          <div>
            <Label htmlFor="previousClubs">Equipos anteriores</Label>
            <Textarea
              id="previousClubs"
              value={formData.previousClubs}
              onChange={(e) => updateFormData({ previousClubs: e.target.value })}
              placeholder="CB Estudiantes (2018-2020), CB Canarias (2015-2018)..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lista tus experiencias anteriores con años
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Categorías Entrenadas</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={formData.categoriesCoached?.includes(cat) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleCategory(cat)}
            >
              {cat}
              {formData.categoriesCoached?.includes(cat) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Logros y Reconocimientos</h3>
        <div>
          <Label htmlFor="achievements">Títulos o logros destacados</Label>
          <Textarea
            id="achievements"
            value={formData.achievements}
            onChange={(e) => updateFormData({ achievements: e.target.value })}
            placeholder="Ascenso a LEB Plata (2020), Campeón territorial junior (2018)..."
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Campeonatos, ascensos, premios individuales, jugadores desarrollados, etc.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Experiencia Adicional</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="roleExperience">Experiencia como</Label>
            <Input
              id="roleExperience"
              value={formData.roleExperience}
              onChange={(e) => updateFormData({ roleExperience: e.target.value })}
              placeholder="Primer entrenador, Asistente, Ambos..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internationalExp"
                checked={formData.internationalExp || false}
                onCheckedChange={(checked) => updateFormData({ internationalExp: checked })}
              />
              <Label htmlFor="internationalExp" className="cursor-pointer">
                Experiencia internacional
              </Label>
            </div>

            {formData.internationalExp && (
              <div>
                <Label htmlFor="internationalExpDesc">Describe tu experiencia internacional</Label>
                <Textarea
                  id="internationalExpDesc"
                  value={formData.internationalExpDesc}
                  onChange={(e) => updateFormData({ internationalExpDesc: e.target.value })}
                  placeholder="Entrenador asistente en equipo italiano Serie B (2019)..."
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="nationalTeamExp"
                checked={formData.nationalTeamExp || false}
                onCheckedChange={(checked) => updateFormData({ nationalTeamExp: checked })}
              />
              <Label htmlFor="nationalTeamExp" className="cursor-pointer">
                Experiencia en selecciones autonómicas/nacionales
              </Label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
