'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'

interface CoachGeneralDataStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachGeneralDataStep({ formData, updateFormData }: CoachGeneralDataStepProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i - 18)

  const availableLanguages = ['Español', 'Inglés', 'Francés', 'Italiano', 'Alemán', 'Portugués']

  const toggleLanguage = (lang: string) => {
    const current = formData.languages || []
    if (current.includes(lang)) {
      updateFormData({ languages: current.filter((l: string) => l !== lang) })
    } else {
      updateFormData({ languages: [...current, lang] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 1 de 6:</strong> Datos generales - Información básica de identificación
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Información Personal</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              placeholder="Juan Pérez García"
            />
          </div>

          <div>
            <Label htmlFor="birthYear">Año de nacimiento</Label>
            <Select
              value={formData.birthYear?.toString()}
              onValueChange={(value) => updateFormData({ birthYear: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidad</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => updateFormData({ nationality: e.target.value })}
              placeholder="España"
            />
          </div>

          <div>
            <Label htmlFor="city">Ciudad actual *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="Madrid"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Idiomas</h3>
        <div className="space-y-2">
          {availableLanguages.map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${lang}`}
                checked={formData.languages?.includes(lang) || false}
                onCheckedChange={() => toggleLanguage(lang)}
              />
              <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                {lang}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Experiencia y Nivel</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentLevel">Nivel actual de entrenamiento</Label>
            <Select
              value={formData.currentLevel}
              onValueChange={(value) => updateFormData({ currentLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Base">Base</SelectItem>
                <SelectItem value="Amateur">Amateur</SelectItem>
                <SelectItem value="Semi-profesional">Semi-profesional</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="federativeLicense">Licencia federativa</Label>
            <Select
              value={formData.federativeLicense}
              onValueChange={(value) => updateFormData({ federativeLicense: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nivel de licencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nivel 1">Nivel 1</SelectItem>
                <SelectItem value="Nivel 2">Nivel 2</SelectItem>
                <SelectItem value="Nivel 3">Nivel 3</SelectItem>
                <SelectItem value="Superior">Superior</SelectItem>
                <SelectItem value="FIBA">FIBA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="totalExperience">Años de experiencia</Label>
            <Input
              id="totalExperience"
              type="number"
              min="0"
              max="50"
              value={formData.totalExperience}
              onChange={(e) => updateFormData({ totalExperience: parseInt(e.target.value) })}
              placeholder="5"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Disponibilidad</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="willingToRelocate"
            checked={formData.willingToRelocate || false}
            onCheckedChange={(checked) => updateFormData({ willingToRelocate: checked })}
          />
          <Label htmlFor="willingToRelocate" className="cursor-pointer">
            Disponible para viajar o cambiar de residencia
          </Label>
        </div>
      </Card>
    </div>
  )
}
