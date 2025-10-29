'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ClubEntityStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function ClubEntityStep({ formData, updateFormData }: ClubEntityStepProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i)

  const competitions = [
    'ACB', 'LEB Oro', 'LEB Plata', 'EBA', 'Liga Femenina', 
    'Liga Femenina 2', 'NCAA', 'FIBA', 'Ligas Europeas', 'Ligas Locales'
  ]

  const sections = ['Masculina', 'Femenina', 'Mixta', 'Formación', 'Cantera']

  const languages = ['Español', 'Inglés', 'Francés', 'Italiano', 'Alemán', 'Portugués']

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
          <strong>Paso 1 de 5:</strong> Perfil de la entidad - Información básica
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Información Básica</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legalName">Nombre legal *</Label>
            <Input
              id="legalName"
              value={formData.legalName}
              onChange={(e) => updateFormData({ legalName: e.target.value })}
              placeholder="Real Madrid Baloncesto S.A.D."
            />
          </div>

          <div>
            <Label htmlFor="commercialName">Nombre comercial (opcional)</Label>
            <Input
              id="commercialName"
              value={formData.commercialName}
              onChange={(e) => updateFormData({ commercialName: e.target.value })}
              placeholder="Real Madrid"
            />
          </div>

          <div>
            <Label htmlFor="entityType">Tipo de entidad *</Label>
            <Select
              value={formData.entityType}
              onValueChange={(value) => updateFormData({ entityType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="agencia">Agencia</SelectItem>
                <SelectItem value="academia">Academia</SelectItem>
                <SelectItem value="programa_universitario">Programa Universitario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="foundedYear">Año de fundación</Label>
            <Select
              value={formData.foundedYear?.toString()}
              onValueChange={(value) => updateFormData({ foundedYear: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Año" />
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
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Ubicación</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => updateFormData({ country: e.target.value })}
              placeholder="España"
            />
          </div>

          <div>
            <Label htmlFor="province">Provincia/Estado</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => updateFormData({ province: e.target.value })}
              placeholder="Madrid"
            />
          </div>

          <div>
            <Label htmlFor="city">Ciudad *</Label>
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
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Competiciones</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {competitions.map((comp) => (
            <Badge
              key={comp}
              variant={formData.competitions?.includes(comp) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem('competitions', comp)}
            >
              {comp}
              {formData.competitions?.includes(comp) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Secciones</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {sections.map((section) => (
            <Badge
              key={section}
              variant={formData.sections?.includes(section) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleItem('sections', section)}
            >
              {section}
              {formData.sections?.includes(section) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Detalles Organizativos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rosterSize">Tamaño de plantilla (jugadores)</Label>
            <Input
              id="rosterSize"
              type="number"
              value={formData.rosterSize}
              onChange={(e) => updateFormData({ rosterSize: parseInt(e.target.value) })}
              placeholder="15"
            />
          </div>

          <div>
            <Label htmlFor="staffSize">Tamaño de staff (personal)</Label>
            <Input
              id="staffSize"
              type="number"
              value={formData.staffSize}
              onChange={(e) => updateFormData({ staffSize: parseInt(e.target.value) })}
              placeholder="8"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Idiomas de Trabajo</h3>
        <div className="space-y-2">
          {languages.map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${lang}`}
                checked={formData.workingLanguages?.includes(lang) || false}
                onCheckedChange={() => toggleItem('workingLanguages', lang)}
              />
              <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                {lang}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Descripción</h3>
        <div>
          <Label htmlFor="description">Sobre la organización</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe tu organización, su historia, valores y cultura..."
            rows={4}
          />
        </div>
      </Card>
    </div>
  )
}
