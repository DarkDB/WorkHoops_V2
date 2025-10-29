'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Building, 
  Phone, 
  Search, 
  DollarSign,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Shield,
  X
} from 'lucide-react'

import ClubEntityStep from './onboarding/club/ClubEntityStep'
import ClubContactStep from './onboarding/club/ClubContactStep'
import ClubNeedsStep from './onboarding/club/ClubNeedsStep'
import ClubConditionsStep from './onboarding/club/ClubConditionsStep'
import ClubVerificationStep from './onboarding/club/ClubVerificationStep'

interface ClubAgencyProfileOnboardingProps {
  user: any
  existingProfile: any
}

export default function ClubAgencyProfileOnboarding({ user, existingProfile }: ClubAgencyProfileOnboardingProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Helper to parse JSON fields
  const parseJsonField = (field: any): any[] => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }
  
  const [formData, setFormData] = useState({
    // Paso 1: Entidad
    legalName: existingProfile?.legalName || '',
    commercialName: existingProfile?.commercialName || '',
    entityType: existingProfile?.entityType || '',
    foundedYear: existingProfile?.foundedYear || null,
    country: existingProfile?.country || 'España',
    province: existingProfile?.province || '',
    city: existingProfile?.city || '',
    competitions: parseJsonField(existingProfile?.competitions),
    sections: parseJsonField(existingProfile?.sections),
    rosterSize: existingProfile?.rosterSize || null,
    staffSize: existingProfile?.staffSize || null,
    workingLanguages: parseJsonField(existingProfile?.workingLanguages),
    description: existingProfile?.description || '',
    
    // Paso 2: Contacto
    contactPerson: existingProfile?.contactPerson || '',
    contactRole: existingProfile?.contactRole || '',
    contactEmail: existingProfile?.contactEmail || user?.email || '',
    contactPhone: existingProfile?.contactPhone || '',
    contactPreference: existingProfile?.contactPreference || '',
    website: existingProfile?.website || '',
    instagramUrl: existingProfile?.instagramUrl || '',
    twitterUrl: existingProfile?.twitterUrl || '',
    linkedinUrl: existingProfile?.linkedinUrl || '',
    youtubeUrl: existingProfile?.youtubeUrl || '',
    showEmailPublic: existingProfile?.showEmailPublic || false,
    showPhonePublic: existingProfile?.showPhonePublic || false,
    candidatesViaPortal: existingProfile?.candidatesViaPortal !== false,
    fiscalDocument: existingProfile?.fiscalDocument || '',
    
    // Paso 3: Necesidades
    profilesNeeded: parseJsonField(existingProfile?.profilesNeeded),
    ageRangeMin: existingProfile?.ageRangeMin || null,
    ageRangeMax: existingProfile?.ageRangeMax || null,
    experienceRequired: existingProfile?.experienceRequired || '',
    keySkills: parseJsonField(existingProfile?.keySkills),
    competitiveReqs: existingProfile?.competitiveReqs || '',
    availabilityNeeded: existingProfile?.availabilityNeeded || '',
    scoutingNotes: existingProfile?.scoutingNotes || '',
    
    // Paso 4: Condiciones
    salaryRange: existingProfile?.salaryRange || '',
    housingProvided: existingProfile?.housingProvided || false,
    mealsTransport: existingProfile?.mealsTransport || false,
    medicalInsurance: existingProfile?.medicalInsurance || false,
    visaSupport: existingProfile?.visaSupport || false,
    contractType: existingProfile?.contractType || '',
    requiredDocs: existingProfile?.requiredDocs || '',
    agentPolicy: existingProfile?.agentPolicy || '',
    
    // Paso 5: Verificación
    logo: existingProfile?.logo || '',
    facilityPhotos: parseJsonField(existingProfile?.facilityPhotos),
    facilityPhotosInput: parseJsonField(existingProfile?.facilityPhotos).join(', '),
    institutionalVideo: existingProfile?.institutionalVideo || '',
    requestVerification: false
  })

  const steps = [
    { number: 1, title: 'Entidad', icon: <Building className="w-5 h-5" />, component: ClubEntityStep },
    { number: 2, title: 'Contacto', icon: <Phone className="w-5 h-5" />, component: ClubContactStep },
    { number: 3, title: 'Necesidades', icon: <Search className="w-5 h-5" />, component: ClubNeedsStep },
    { number: 4, title: 'Condiciones', icon: <DollarSign className="w-5 h-5" />, component: ClubConditionsStep },
    { number: 5, title: 'Verificación', icon: <Shield className="w-5 h-5" />, component: ClubVerificationStep }
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
      const response = await fetch('/api/club-agency/profile-onboarding', {
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
        if (!formData.legalName.trim()) {
          toast.error('El nombre legal es requerido')
          return false
        }
        if (!formData.entityType) {
          toast.error('El tipo de entidad es requerido')
          return false
        }
        if (!formData.city.trim()) {
          toast.error('La ciudad es requerida')
          return false
        }
        return true
      case 2:
        if (!formData.contactEmail.trim()) {
          toast.error('El email de contacto es requerido')
          return false
        }
        return true
      case 3:
        return true // Todos opcionales
      case 4:
        return true // Todos opcionales
      case 5:
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
      const response = await fetch('/api/club-agency/profile-onboarding', {
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
        description: 'Tu perfil de organización ha sido guardado correctamente'
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
            <h1 className="text-3xl font-bold text-gray-900">Completa tu Perfil de Organización</h1>
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
