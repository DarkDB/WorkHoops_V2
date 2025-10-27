'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  User, 
  Activity, 
  Target, 
  Video,
  ChevronRight,
  ChevronLeft,
  Check,
  X
} from 'lucide-react'

// Import step components
import TechnicalDataStep from './onboarding/TechnicalDataStep'
import SkillsStep from './onboarding/SkillsStep'
import PlayingStyleStep from './onboarding/PlayingStyleStep'
import MultimediaStep from './onboarding/MultimediaStep'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface PlayerProfileOnboardingProps {
  user: User
  existingProfile: any | null
}

export default function PlayerProfileOnboarding({ user, existingProfile }: PlayerProfileOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  
  // Form data state
  const [formData, setFormData] = useState({
    // Paso 1: Datos técnicos
    fullName: existingProfile?.fullName || user.name || '',
    birthDate: existingProfile?.birthDate || '',
    city: existingProfile?.city || '',
    position: existingProfile?.position || '',
    secondaryPosition: existingProfile?.secondaryPosition || '',
    height: existingProfile?.height || '',
    weight: existingProfile?.weight || '',
    wingspan: existingProfile?.wingspan || '',
    dominantHand: existingProfile?.dominantHand || '',
    currentLevel: existingProfile?.currentLevel || '',
    lastTeam: existingProfile?.lastTeam || '',
    currentCategory: existingProfile?.currentCategory || '',
    
    // Paso 2: Habilidades (valores por defecto 3)
    skills: existingProfile?.playerSkills || {
      threePointShot: 3,
      midRangeShot: 3,
      finishing: 3,
      ballHandling: 3,
      playmaking: 3,
      offBallMovement: 3,
      individualDefense: 3,
      teamDefense: 3,
      offensiveRebound: 3,
      defensiveRebound: 3,
      speed: 3,
      athleticism: 3,
      endurance: 3,
      leadership: 3,
      decisionMaking: 3
    },
    
    // Paso 3: Estilo y complementarios
    playingStyle: existingProfile?.playingStyle ? JSON.parse(existingProfile.playingStyle) : [],
    languages: existingProfile?.languages ? JSON.parse(existingProfile.languages) : [],
    willingToTravel: existingProfile?.willingToTravel || false,
    weeklyCommitment: existingProfile?.weeklyCommitment || '',
    internationalExperience: existingProfile?.internationalExperience || false,
    hasLicense: existingProfile?.hasLicense || false,
    injuryHistory: existingProfile?.injuryHistory || '',
    currentGoal: existingProfile?.currentGoal || '',
    bio: existingProfile?.bio || '',
    
    // Paso 4: Multimedia
    videoUrl: existingProfile?.videoUrl || '',
    fullGameUrl: existingProfile?.fullGameUrl || '',
    socialUrl: existingProfile?.socialUrl || '',
    photoUrls: existingProfile?.photoUrls ? JSON.parse(existingProfile.photoUrls) : []
  })

  const steps = [
    { 
      number: 1, 
      title: 'Datos Técnicos', 
      icon: User,
      description: 'Información básica y posición'
    },
    { 
      number: 2, 
      title: 'Habilidades', 
      icon: Activity,
      description: 'Evalúa tus capacidades'
    },
    { 
      number: 3, 
      title: 'Estilo de Juego', 
      icon: Target,
      description: 'Define tu perfil'
    },
    { 
      number: 4, 
      title: 'Multimedia', 
      icon: Video,
      description: 'Videos y fotos (opcional)'
    }
  ]

  // Calcular progreso
  const calculateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100
  }

  // Validar campos obligatorios del paso actual
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Campos obligatorios del paso 1
      const required = ['fullName', 'birthDate', 'city', 'position', 'height', 'weight']
      return required.every(field => formData[field as keyof typeof formData])
    }
    // Pasos 2, 3 y 4 son opcionales
    return true
  }

  // Guardar progreso automáticamente
  const saveProgress = async (showToast = true) => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/talent/profile-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          currentStep
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar')
      }

      if (showToast) {
        toast.success('Progreso guardado', {
          description: 'Tus datos se han guardado correctamente'
        })
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      if (showToast) {
        toast.error('Error', {
          description: 'No se pudo guardar el progreso'
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Ir al siguiente paso
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios'
      })
      return
    }

    await saveProgress(false)
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Ir al paso anterior
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Saltar y guardar
  const handleSkipAndSave = async () => {
    await saveProgress()
    router.push('/dashboard')
  }

  // Finalizar onboarding
  const handleFinish = async () => {
    await saveProgress(false)
    
    toast.success('¡Perfil completado!', {
      description: 'Tu perfil está listo y visible para los clubs'
    })
    
    router.push('/dashboard')
  }

  // Actualizar formData
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Determinar si puede saltar
  useEffect(() => {
    setCanSkip(currentStep > 1)
  }, [currentStep])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Completa tu Perfil de {user.role === 'jugador' ? 'Jugador' : 'Entrenador'}
        </h1>
        <p className="text-gray-600">
          {existingProfile 
            ? 'Actualiza tu información para destacar ante los clubs' 
            : 'Crea tu perfil profesional paso a paso'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(calculateProgress())}% completado
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div 
                key={step.number} 
                className="flex flex-col items-center flex-1"
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                      ? 'bg-workhoops-accent text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center hidden md:block">
                  <p className={`text-xs font-medium ${isActive ? 'text-workhoops-accent' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <TechnicalDataStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <SkillsStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <PlayingStyleStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <MultimediaStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSaving}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          {canSkip && (
            <Button
              variant="ghost"
              onClick={handleSkipAndSave}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Salir y guardar
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={isSaving || !validateCurrentStep()}
              className="bg-workhoops-accent hover:bg-orange-600"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Guardando...
        </div>
      )}
    </div>
  )
}
