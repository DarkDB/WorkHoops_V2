'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  User, 
  Briefcase, 
  Activity, 
  Target, 
  GraduationCap,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  X
} from 'lucide-react'

import CoachGeneralDataStep from './onboarding/coach/CoachGeneralDataStep'
import CoachExperienceStep from './onboarding/coach/CoachExperienceStep'
import CoachSkillsStep from './onboarding/coach/CoachSkillsStep'
import CoachPhilosophyStep from './onboarding/coach/CoachPhilosophyStep'
import CoachFormationStep from './onboarding/coach/CoachFormationStep'
import CoachObjectivesStep from './onboarding/coach/CoachObjectivesStep'

interface CoachProfileOnboardingProps {
  user: any
  existingProfile: any
}

export default function CoachProfileOnboarding({ user, existingProfile }: CoachProfileOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    // Paso 1: Datos Generales
    fullName: existingProfile?.fullName || user?.name || '',
    birthYear: existingProfile?.birthYear || null,
    nationality: existingProfile?.nationality || 'España',
    languages: existingProfile?.languages ? (
      typeof existingProfile.languages === 'string'
        ? JSON.parse(existingProfile.languages)
        : existingProfile.languages
    ) : [],
    city: existingProfile?.city || '',
    willingToRelocate: existingProfile?.willingToRelocate || false,
    currentLevel: existingProfile?.currentLevel || '',
    federativeLicense: existingProfile?.federativeLicense || '',
    totalExperience: existingProfile?.totalExperience || null,
    
    // Paso 2: Experiencia
    currentClub: existingProfile?.currentClub || '',
    previousClubs: existingProfile?.previousClubs || '',
    categoriesCoached: existingProfile?.categoriesCoached ? (
      typeof existingProfile.categoriesCoached === 'string'
        ? JSON.parse(existingProfile.categoriesCoached)
        : existingProfile.categoriesCoached
    ) : [],
    achievements: existingProfile?.achievements || '',
    internationalExp: existingProfile?.internationalExp || false,
    internationalExpDesc: existingProfile?.internationalExpDesc || '',
    roleExperience: existingProfile?.roleExperience || '',
    nationalTeamExp: existingProfile?.nationalTeamExp || false,
    
    // Paso 3: Skills (valores por defecto 3)
    trainingPlanning: existingProfile?.trainingPlanning || 3,
    individualDevelopment: existingProfile?.individualDevelopment || 3,
    offensiveTactics: existingProfile?.offensiveTactics || 3,
    defensiveTactics: existingProfile?.defensiveTactics || 3,
    groupManagement: existingProfile?.groupManagement || 3,
    scoutingAnalysis: existingProfile?.scoutingAnalysis || 3,
    staffManagement: existingProfile?.staffManagement || 3,
    communication: existingProfile?.communication || 3,
    tacticalAdaptability: existingProfile?.tacticalAdaptability || 3,
    digitalTools: existingProfile?.digitalTools || 3,
    physicalPreparation: existingProfile?.physicalPreparation || 3,
    youthDevelopment: existingProfile?.youthDevelopment || 3,
    
    // Paso 4: Filosofía
    playingStyle: existingProfile?.playingStyle ? (
      typeof existingProfile.playingStyle === 'string'
        ? JSON.parse(existingProfile.playingStyle)
        : existingProfile.playingStyle
    ) : [],
    workPriority: existingProfile?.workPriority || '',
    playerTypePreference: existingProfile?.playerTypePreference || '',
    inspirations: existingProfile?.inspirations || '',
    
    // Paso 5: Formación
    academicDegrees: existingProfile?.academicDegrees || '',
    certifications: existingProfile?.certifications || '',
    coursesAttended: existingProfile?.coursesAttended || '',
    videoUrl: existingProfile?.videoUrl || '',
    presentationsUrl: existingProfile?.presentationsUrl || '',
    
    // Paso 6: Objetivos y Competencias
    currentGoal: existingProfile?.currentGoal || '',
    offerType: existingProfile?.offerType || '',
    availability: existingProfile?.availability || '',
    leadership: existingProfile?.leadership || 3,
    teamwork: existingProfile?.teamwork || 3,
    conflictResolution: existingProfile?.conflictResolution || 3,
    organization: existingProfile?.organization || 3,
    adaptability: existingProfile?.adaptability || 3,
    innovation: existingProfile?.innovation || 3,
    bio: existingProfile?.bio || ''
  })

  const steps = [
    { number: 1, title: 'Datos Generales', icon: <User className="w-5 h-5" />, component: CoachGeneralDataStep },
    { number: 2, title: 'Experiencia', icon: <Briefcase className="w-5 h-5" />, component: CoachExperienceStep },
    { number: 3, title: 'Skills', icon: <Activity className="w-5 h-5" />, component: CoachSkillsStep },
    { number: 4, title: 'Filosofía', icon: <Target className="w-5 h-5" />, component: CoachPhilosophyStep },
    { number: 5, title: 'Formación', icon: <GraduationCap className="w-5 h-5" />, component: CoachFormationStep },
    { number: 6, title: 'Objetivos', icon: <Award className="w-5 h-5" />, component: CoachObjectivesStep }
  ]

  const updateFormData = (newData: any) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!saving) {
        handleSave(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData, saving])

  const handleSave = async (showToast = true) => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/coach/profile-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentStep
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar')
      }

      if (showToast) {
        toast.success('Progreso guardado')
      }
    } catch (error) {
      console.error('Error saving:', error)
      if (showToast) {
        toast.error('Error al guardar el progreso')
      }
    } finally {
      setSaving(false)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error('El nombre completo es requerido')
          return false
        }
        if (!formData.city.trim()) {
          toast.error('La ciudad es requerida')
          return false
        }
        return true
      case 2:
        return true // Todos los campos son opcionales
      case 3:
        return true // Valores por defecto ya asignados
      case 4:
        return true
      case 5:
        return true
      case 6:
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    await handleSave(false)

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinish = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch('/api/coach/profile-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentStep: steps.length
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar')
      }

      toast.success('¡Perfil completado!', {
        description: 'Tu perfil de entrenador ha sido guardado correctamente'
      })

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Error finishing:', error)
      toast.error('Error al completar el perfil')
      setSaving(false)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1].component
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Completa tu Perfil de Entrenador</h1>
            <p className="text-gray-600 mt-1">Paso {currentStep} de {steps.length}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <X className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                className={`flex flex-col items-center ${
                  step.number <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : step.number === currentStep
                      ? 'bg-workhoops-accent text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-xs mt-2 text-center hidden md:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div
                    className="h-full bg-workhoops-accent transition-all"
                    style={{ width: step.number < currentStep ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            {steps[currentStep - 1].icon}
            <span className="ml-2">{steps[currentStep - 1].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || saving}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar progreso'}
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={saving}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {saving ? 'Finalizando...' : 'Finalizar'}
            </Button>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
          Guardando...
        </div>
      )}
    </div>
  )
}
