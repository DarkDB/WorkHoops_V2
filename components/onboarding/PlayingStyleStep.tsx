'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { COUNTRY_OPTIONS, RELOCATION_PREFERENCE_OPTIONS } from '@/lib/recruiting-preferences'

interface PlayingStyleStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function PlayingStyleStep({ formData, updateFormData }: PlayingStyleStepProps) {
  const playingStyles = [
    { value: 'Playmaker', label: 'Playmaker', description: 'Creador de juego' },
    { value: 'Tirador', label: 'Tirador', description: 'Especialista en tiro' },
    { value: 'Penetrador', label: 'Penetrador', description: 'Ataca el aro' },
    { value: 'Defensor', label: 'Defensor especialista', description: 'Enfocado en defensa' },
    { value: 'Rebotador', label: 'Rebotador', description: 'Domina los tableros' },
    { value: 'Facilitador', label: 'Facilitador', description: 'Genera oportunidades' },
    { value: 'Versátil', label: 'Versátil / All-around', description: 'Completo' },
    { value: 'Anotador', label: 'Anotador puro', description: 'Busca la canasta' },
    { value: 'Rol', label: 'Jugador de rol / equipo', description: 'Hace lo que el equipo necesita' }
  ]

  const languageOptions = [
    'Español',
    'Inglés',
    'Francés',
    'Italiano',
    'Portugués',
    'Alemán',
    'Catalán',
    'Euskera',
    'Gallego'
  ]

  const goals = [
    'Encontrar equipo',
    'Mejorar nivel',
    'Beca universitaria',
    'Promocionarse',
    'Profesionalizarse',
    'Jugar en el extranjero',
    'Otro'
  ]

  const availabilityOptions = [
    { value: 'AVAILABLE', label: 'Disponible ahora' },
    { value: 'OPEN_TO_OFFERS', label: 'Abierto a ofertas' },
    { value: 'NOT_AVAILABLE', label: 'No disponible' }
  ]

  const toggleStyle = (style: string) => {
    const current = formData.playingStyle || []
    if (current.includes(style)) {
      updateFormData({
        playingStyle: current.filter((s: string) => s !== style)
      })
    } else {
      updateFormData({
        playingStyle: [...current, style]
      })
    }
  }

  const toggleLanguage = (lang: string) => {
    const current = formData.languages || []
    if (current.includes(lang)) {
      updateFormData({
        languages: current.filter((l: string) => l !== lang)
      })
    } else {
      updateFormData({
        languages: [...current, lang]
      })
    }
  }

  const toggleTargetCountry = (country: string) => {
    const current = formData.targetCountries || []
    if (!current.includes(country) && current.length >= 12) return
    updateFormData({
      targetCountries: current.includes(country)
        ? current.filter((item: string) => item !== country)
        : [...current, country]
    })
  }

  return (
    <div className="space-y-6">
      {/* Estilo de Juego */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Estilo de Juego
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona uno o varios estilos que te definan (máximo 3)
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {playingStyles.map((style) => (
            <div
              key={style.value}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                (formData.playingStyle || []).includes(style.value)
                  ? 'border-workhoops-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleStyle(style.value)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={(formData.playingStyle || []).includes(style.value)}
                  onCheckedChange={() => toggleStyle(style.value)}
                />
                <div>
                  <p className="font-medium text-sm">{style.label}</p>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Biografía */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Biografía / Presentación
        </h3>
        <Textarea
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          placeholder="Cuéntanos sobre ti, tu experiencia y lo que te hace destacar como jugador..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-2">
          {formData.bio?.length || 0} / 500 caracteres
        </p>
      </Card>

      {/* Aspectos Complementarios */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Preferencias para encontrar equipo</h3>
        <p className="mt-1 text-sm text-gray-600">
          Opcional. Ayuda a los clubes a entender qué oportunidades pueden encajar contigo.
        </p>
        <div className="mt-5 space-y-5">
          <div>
            <Label htmlFor="relocationPreference">Movilidad</Label>
            <Select
              value={formData.relocationPreference || 'NOT_PROVIDED'}
              onValueChange={(value) => updateFormData({ relocationPreference: value })}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
              <SelectContent>
                {RELOCATION_PREFERENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Países donde te interesaría jugar (máximo 12)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COUNTRY_OPTIONS.map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={`target-country-${country}`}
                    checked={(formData.targetCountries || []).includes(country)}
                    onCheckedChange={() => toggleTargetCountry(country)}
                  />
                  <Label htmlFor={`target-country-${country}`} className="cursor-pointer text-sm">{country}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="isStudent">Situación de estudios</Label>
            <Select
              value={formData.isStudent === null || formData.isStudent === undefined ? 'NOT_PROVIDED' : formData.isStudent ? 'YES' : 'NO'}
              onValueChange={(value) => updateFormData({ isStudent: value === 'NOT_PROVIDED' ? null : value === 'YES' })}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_PROVIDED">Prefiero no indicarlo</SelectItem>
                <SelectItem value="YES">Estoy estudiando</SelectItem>
                <SelectItem value="NO">No estoy estudiando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Información Adicional
        </h3>
        <div className="space-y-4">
          {/* Idiomas */}
          <div>
            <Label className="mb-2 block">Idiomas que hablas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languageOptions.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={(formData.languages || []).includes(lang)}
                    onCheckedChange={() => toggleLanguage(lang)}
                  />
                  <Label
                    htmlFor={`lang-${lang}`}
                    className="text-sm cursor-pointer"
                  >
                    {lang}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Disponibilidad para viajar */}
          <div>
            <Label htmlFor="availabilityStatus">Estado de disponibilidad</Label>
            <Select
              value={formData.availabilityStatus || 'OPEN_TO_OFFERS'}
              onValueChange={(value) => updateFormData({
                availabilityStatus: value,
                availabilityConfirmationRequested: true
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.availabilityStatus === 'AVAILABLE' || formData.availabilityStatus === 'OPEN_TO_OFFERS') && (
            <div>
              <Label htmlFor="availableFrom">Disponible a partir de (opcional)</Label>
              <Input
                id="availableFrom"
                type="date"
                value={formData.availableFrom || ''}
                onChange={(e) => updateFormData({ availableFrom: e.target.value })}
              />
            </div>
          )}

          {/* Disponibilidad para viajar */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="willingToTravel"
              checked={formData.willingToTravel}
              onCheckedChange={(checked) => updateFormData({ willingToTravel: checked })}
            />
            <Label htmlFor="willingToTravel" className="cursor-pointer">
              Disponible para cambiar de ciudad/país
            </Label>
          </div>

          {/* Compromiso semanal */}
          <div>
            <Label htmlFor="weeklyCommitment">Compromiso semanal (horas de entrenamiento)</Label>
            <Input
              id="weeklyCommitment"
              type="number"
              value={formData.weeklyCommitment}
              onChange={(e) => updateFormData({ weeklyCommitment: e.target.value })}
              placeholder="Ej: 15"
              min="0"
              max="50"
            />
          </div>

          {/* Experiencia internacional */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="internationalExperience"
              checked={formData.internationalExperience}
              onCheckedChange={(checked) => updateFormData({ internationalExperience: checked })}
            />
            <Label htmlFor="internationalExperience" className="cursor-pointer">
              Tengo experiencia internacional
            </Label>
          </div>

          {/* Licencia federativa */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasLicense"
              checked={formData.hasLicense}
              onCheckedChange={(checked) => updateFormData({ hasLicense: checked })}
            />
            <Label htmlFor="hasLicense" className="cursor-pointer">
              Tengo licencia federativa activa
            </Label>
          </div>

          {/* Objetivo actual */}
          <div>
            <Label htmlFor="currentGoal">Objetivo actual</Label>
            <Select
              value={formData.currentGoal}
              onValueChange={(value) => updateFormData({ currentGoal: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿Qué buscas actualmente?" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Historial de lesiones */}
          <div>
            <Label htmlFor="injuryHistory">Historial de lesiones (opcional)</Label>
            <Textarea
              id="injuryHistory"
              value={formData.injuryHistory}
              onChange={(e) => updateFormData({ injuryHistory: e.target.value })}
              placeholder="Si has tenido lesiones significativas, menciónalo aquí..."
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta información es opcional y confidencial
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
