'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Activity, Target, Users, BarChart } from 'lucide-react'

interface CoachSkillsStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function CoachSkillsStep({ formData, updateFormData }: CoachSkillsStepProps) {
  const skillCategories = [
    {
      title: 'Planificación y Desarrollo',
      icon: <Target className="w-5 h-5" />,
      skills: [
        { key: 'trainingPlanning', label: 'Planificación de entrenamientos' },
        { key: 'individualDevelopment', label: 'Desarrollo individual de jugadores' },
        { key: 'youthDevelopment', label: 'Trabajo con categorías de formación' }
      ]
    },
    {
      title: 'Táctica',
      icon: <Activity className="w-5 h-5" />,
      skills: [
        { key: 'offensiveTactics', label: 'Táctica ofensiva' },
        { key: 'defensiveTactics', label: 'Táctica defensiva' },
        { key: 'scoutingAnalysis', label: 'Scouting y análisis de rivales' },
        { key: 'tacticalAdaptability', label: 'Adaptabilidad / Innovación táctica' }
      ]
    },
    {
      title: 'Gestión y Liderazgo',
      icon: <Users className="w-5 h-5" />,
      skills: [
        { key: 'groupManagement', label: 'Gestión de grupo / Liderazgo' },
        { key: 'staffManagement', label: 'Gestión de staff técnico' },
        { key: 'communication', label: 'Comunicación y motivación' }
      ]
    },
    {
      title: 'Conocimientos Complementarios',
      icon: <BarChart className="w-5 h-5" />,
      skills: [
        { key: 'digitalTools', label: 'Herramientas digitales (Hudl, Synergy, etc.)' },
        { key: 'physicalPreparation', label: 'Preparación física básica' }
      ]
    }
  ]

  const updateSkill = (skillKey: string, value: number) => {
    updateFormData({ [skillKey]: value })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Paso 3 de 6:</strong> Skills técnicas y tácticas - Evalúa tus fortalezas (1-5)
        </p>
      </div>

      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>1 - Principiante</span>
          <span>3 - Competente</span>
          <span>5 - Experto</span>
        </div>
      </Card>

      {skillCategories.map((category) => (
        <Card key={category.title} className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            {category.icon}
            <span className="ml-2">{category.title}</span>
          </h3>
          <div className="space-y-4">
            {category.skills.map((skill) => {
              const value = formData[skill.key] || 3
              return (
                <div key={skill.key}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">{skill.label}</Label>
                    <span className="text-sm font-medium text-gray-900">{value}/5</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => updateSkill(skill.key, vals[0])}
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
      ))}
    </div>
  )
}
