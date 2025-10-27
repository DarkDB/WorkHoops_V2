'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'

interface SkillsStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function SkillsStep({ formData, updateFormData }: SkillsStepProps) {
  const updateSkill = (skillName: string, value: number) => {
    updateFormData({
      skills: {
        ...formData.skills,
        [skillName]: value
      }
    })
  }

  const getSkillLabel = (value: number) => {
    const labels = ['Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Élite']
    return labels[value - 1] || 'Intermedio'
  }

  const getSkillColor = (value: number) => {
    if (value >= 4) return 'text-green-600'
    if (value >= 3) return 'text-blue-600'
    return 'text-gray-600'
  }

  const SkillSlider = ({ 
    name, 
    label, 
    value, 
    description 
  }: { 
    name: string
    label: string
    value: number
    description?: string
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className={`text-sm font-semibold ${getSkillColor(value)}`}>
          {getSkillLabel(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => updateSkill(name, val[0])}
        min={1}
        max={5}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Evalúa tus habilidades:</strong> Califica del 1 al 5 cada habilidad. 
          Sé honesto, esto ayudará a los clubs a encontrarte.
        </p>
      </div>

      {/* Habilidades Ofensivas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="w-2 h-8 bg-orange-500 rounded mr-3"></span>
          Habilidades Ofensivas
        </h3>
        <div className="space-y-6">
          <SkillSlider
            name="threePointShot"
            label="Tiro exterior (3 puntos)"
            value={formData.skills.threePointShot}
            description="Tu efectividad desde el perímetro"
          />
          <SkillSlider
            name="midRangeShot"
            label="Tiro de media distancia"
            value={formData.skills.midRangeShot}
            description="Tiros de 2-6 metros"
          />
          <SkillSlider
            name="finishing"
            label="Finalización en el aro"
            value={formData.skills.finishing}
            description="Bandejas, mates, contacto"
          />
          <SkillSlider
            name="ballHandling"
            label="Manejo de balón / Dribbling"
            value={formData.skills.ballHandling}
            description="Control del balón en movimiento"
          />
          <SkillSlider
            name="playmaking"
            label="Visión de juego / Asistencias"
            value={formData.skills.playmaking}
            description="Capacidad de crear juego para otros"
          />
          <SkillSlider
            name="offBallMovement"
            label="Juego sin balón"
            value={formData.skills.offBallMovement}
            description="Movimientos, cortes, bloqueos"
          />
        </div>
      </Card>

      {/* Habilidades Defensivas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="w-2 h-8 bg-red-500 rounded mr-3"></span>
          Habilidades Defensivas
        </h3>
        <div className="space-y-6">
          <SkillSlider
            name="individualDefense"
            label="Defensa individual"
            value={formData.skills.individualDefense}
            description="Marcar 1 contra 1"
          />
          <SkillSlider
            name="teamDefense"
            label="Defensa en equipo / Ayudas"
            value={formData.skills.teamDefense}
            description="Rotaciones, comunicación"
          />
          <SkillSlider
            name="offensiveRebound"
            label="Rebote ofensivo"
            value={formData.skills.offensiveRebound}
            description="Capturar rebotes en ataque"
          />
          <SkillSlider
            name="defensiveRebound"
            label="Rebote defensivo"
            value={formData.skills.defensiveRebound}
            description="Proteger el aro defensivo"
          />
        </div>
      </Card>

      {/* Atributos Físicos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="w-2 h-8 bg-green-500 rounded mr-3"></span>
          Atributos Físicos
        </h3>
        <div className="space-y-6">
          <SkillSlider
            name="speed"
            label="Velocidad / Agilidad lateral"
            value={formData.skills.speed}
            description="Rapidez en desplazamientos"
          />
          <SkillSlider
            name="athleticism"
            label="Capacidad atlética / Salto vertical"
            value={formData.skills.athleticism}
            description="Explosividad y salto"
          />
          <SkillSlider
            name="endurance"
            label="Resistencia física / Fondo"
            value={formData.skills.endurance}
            description="Aguante durante el partido"
          />
        </div>
      </Card>

      {/* Atributos Mentales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <span className="w-2 h-8 bg-purple-500 rounded mr-3"></span>
          Atributos Mentales
        </h3>
        <div className="space-y-6">
          <SkillSlider
            name="leadership"
            label="Comunicación en pista / Liderazgo"
            value={formData.skills.leadership}
            description="Guiar y motivar al equipo"
          />
          <SkillSlider
            name="decisionMaking"
            label="Toma de decisiones bajo presión"
            value={formData.skills.decisionMaking}
            description="Lectura del juego en momentos críticos"
          />
        </div>
      </Card>
    </div>
  )
}
