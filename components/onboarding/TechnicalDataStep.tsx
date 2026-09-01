'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EU_PASSPORT_OPTIONS } from '@/lib/recruiting-preferences'

interface TechnicalDataStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function TechnicalDataStep({ formData, updateFormData }: TechnicalDataStepProps) {
  const positions = [
    { value: 'Base', label: 'Base (Point Guard)' },
    { value: 'Escolta', label: 'Escolta (Shooting Guard)' },
    { value: 'Alero', label: 'Alero (Small Forward)' },
    { value: 'Ala-Pívot', label: 'Ala-Pívot (Power Forward)' },
    { value: 'Pívot', label: 'Pívot (Center)' }
  ]

  const levels = [
    { value: 'Amateur', label: 'Amateur' },
    { value: 'Semi-Profesional', label: 'Semi-Profesional' },
    { value: 'Profesional', label: 'Profesional' }
  ]

  const categories = [
    'ACB',
    'Primera FEB',
    'Segunda FEB',
    'Tercera FEB',
    '1ª División Autonómica',
    'Liga Provincial',
    'Juvenil',
    'Cadete',
    'Infantil',
    'Otra'
  ]

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Perfil mínimo visible:</strong> Nombre, posición, ciudad y altura. Puedes completar el resto después.
        </p>
      </div>

      {/* Información Personal */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Información Personal</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              placeholder="Ej: Juan García López"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData({ birthDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="Ej: Madrid"
              required
            />
          </div>

          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country || ''}
              onChange={(e) => updateFormData({ country: e.target.value })}
              placeholder="Ej: España"
            />
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidad</Label>
            <Input
              id="nationality"
              value={formData.nationality || ''}
              onChange={(e) => updateFormData({ nationality: e.target.value })}
              placeholder="Ej: Española"
            />
          </div>

          <div>
            <Label htmlFor="euPassportStatus">Pasaporte de la UE</Label>
            <Select
              value={formData.euPassportStatus || 'NOT_PROVIDED'}
              onValueChange={(value) => updateFormData({ euPassportStatus: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {EU_PASSPORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Posición y Características */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Posición y Características Físicas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position">Posición principal *</Label>
            <Select
              value={formData.position}
              onValueChange={(value) => updateFormData({ position: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu posición" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="secondaryPosition">Posición secundaria (opcional)</Label>
            <Select
              value={formData.secondaryPosition || "none"}
              onValueChange={(value) => updateFormData({ secondaryPosition: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Si juegas en otra posición (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="height">Altura (cm) *</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => updateFormData({ height: e.target.value })}
              placeholder="Ej: 185"
              min="140"
              max="240"
              required
            />
          </div>

          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => updateFormData({ weight: e.target.value })}
              placeholder="Ej: 80"
              min="40"
              max="180"
            />
          </div>

          <div>
            <Label htmlFor="wingspan">Envergadura (cm)</Label>
            <Input
              id="wingspan"
              type="number"
              value={formData.wingspan}
              onChange={(e) => updateFormData({ wingspan: e.target.value })}
              placeholder="Ej: 190"
              min="140"
              max="260"
            />
          </div>

          <div>
            <Label htmlFor="dominantHand">Mano dominante</Label>
            <Select
              value={formData.dominantHand}
              onValueChange={(value) => updateFormData({ dominantHand: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Derecha">Derecha</SelectItem>
                <SelectItem value="Izquierda">Izquierda</SelectItem>
                <SelectItem value="Ambas">Ambas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Información Deportiva */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Trayectoria Deportiva</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentLevel">Nivel actual</Label>
            <Select
              value={formData.currentLevel}
              onValueChange={(value) => updateFormData({ currentLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lastTeam">Último equipo o club</Label>
            <Input
              id="lastTeam"
              value={formData.lastTeam}
              onChange={(e) => updateFormData({ lastTeam: e.target.value })}
              placeholder="Ej: CB Estudiantes"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="currentCategory">Categoría / Liga actual</Label>
            <Select
              value={formData.currentCategory}
              onValueChange={(value) => updateFormData({ currentCategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
