import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { trackFunnelEvent } from '@/lib/funnel-events'
import { calculateTalentProfileCompletion } from '@/lib/profile-completion'
import { normalizeOptionalNumber, PHYSICAL_LIMITS, validateNumberRange } from '@/lib/physical-validations'
import { COUNTRY_OPTIONS } from '@/lib/recruiting-preferences'

// Esquema de validación para el onboarding
const profileOnboardingSchema = z.object({
  // Paso 1: Datos técnicos
  fullName: z.string().min(1, 'Nombre completo es requerido'),
  birthDate: z.string().optional(),
  city: z.string().min(1, 'Ciudad es requerida'),
  country: z.string().optional(),
  position: z.string().min(1, 'Posición es requerida'),
  secondaryPosition: z.string().optional(),
  height: z.union([z.string().min(1, 'La altura es requerida'), z.number()]),
  weight: z.union([z.string(), z.number()]).optional(),
  wingspan: z.union([z.string(), z.number()]).optional(),
  dominantHand: z.string().optional(),
  currentLevel: z.string().optional(),
  lastTeam: z.string().optional(),
  currentCategory: z.string().optional(),
  
  // Paso 2: Habilidades
  skills: z.object({
    threePointShot: z.number().min(1).max(5),
    midRangeShot: z.number().min(1).max(5),
    finishing: z.number().min(1).max(5),
    ballHandling: z.number().min(1).max(5),
    playmaking: z.number().min(1).max(5),
    offBallMovement: z.number().min(1).max(5),
    individualDefense: z.number().min(1).max(5),
    teamDefense: z.number().min(1).max(5),
    offensiveRebound: z.number().min(1).max(5),
    defensiveRebound: z.number().min(1).max(5),
    speed: z.number().min(1).max(5),
    athleticism: z.number().min(1).max(5),
    endurance: z.number().min(1).max(5),
    leadership: z.number().min(1).max(5),
    decisionMaking: z.number().min(1).max(5)
  }).optional(),
  
  // Paso 3: Estilo de juego
  playingStyle: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  willingToTravel: z.boolean().optional(),
  weeklyCommitment: z.union([z.string(), z.number()]).optional(),
  internationalExperience: z.boolean().optional(),
  hasLicense: z.boolean().optional(),
  injuryHistory: z.string().optional(),
  currentGoal: z.string().optional(),
  bio: z.string().optional(),
  nationality: z.string().trim().max(100).optional(),
  euPassportStatus: z.enum(['YES', 'NO', 'NOT_PROVIDED']).optional(),
  targetCountries: z.array(z.enum(COUNTRY_OPTIONS)).max(12).optional(),
  relocationPreference: z.enum(['YES', 'DOMESTIC_ONLY', 'STUDIES_ONLY', 'DEPENDS_ON_CONDITIONS', 'NO', 'NOT_PROVIDED']).optional(),
  isStudent: z.boolean().nullable().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE']).optional(),
  availabilityConfirmationRequested: z.boolean().optional(),
  availableFrom: z.string().optional(),
  
  // Paso 4: Multimedia
  videoUrl: z.string().optional(),
  fullGameUrl: z.string().optional(),
  socialUrl: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
  
  // Meta
  currentStep: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que sea jugador o entrenador
    if (session.user.role !== 'jugador' && session.user.role !== 'entrenador') {
      return NextResponse.json({ error: 'Solo jugadores y entrenadores pueden completar este perfil' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = profileOnboardingSchema.parse(body)

    // Convertir valores numéricos
    const heightCm = normalizeOptionalNumber(validatedData.height)
    const weightKg = normalizeOptionalNumber(validatedData.weight)
    const wingspanCm = normalizeOptionalNumber(validatedData.wingspan)
    const weeklyCommitmentNum = normalizeOptionalNumber(validatedData.weeklyCommitment)
    const availabilityStatus = validatedData.availabilityStatus || 'OPEN_TO_OFFERS'
    const availableFromDate =
      availabilityStatus !== 'NOT_AVAILABLE' && validatedData.availableFrom
        ? new Date(validatedData.availableFrom)
        : null
    const targetCountries = Array.from(new Set(validatedData.targetCountries || []))

    const defaultSkills = {
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
    }

    const validatedSkills = validatedData.skills || defaultSkills

    // Convertir birthDate a DateTime
    const birthDateObj = validatedData.birthDate ? new Date(validatedData.birthDate) : null
    validateNumberRange(heightCm, PHYSICAL_LIMITS.height.min, PHYSICAL_LIMITS.height.max, 'La altura')
    validateNumberRange(weightKg, PHYSICAL_LIMITS.weight.min, PHYSICAL_LIMITS.weight.max, 'El peso')
    validateNumberRange(wingspanCm, PHYSICAL_LIMITS.wingspan.min, PHYSICAL_LIMITS.wingspan.max, 'La envergadura')

    const profileCompletionPercentage = calculateTalentProfileCompletion({
      fullName: validatedData.fullName,
      city: validatedData.city,
      position: validatedData.position,
      height: validatedData.height,
      availabilityStatus
    })

    // Buscar perfil existente
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      const availabilityChanged =
        existingProfile.availabilityStatus !== availabilityStatus ||
        ((existingProfile.availableFrom && availableFromDate)
          ? existingProfile.availableFrom.getTime() !== availableFromDate.getTime()
          : existingProfile.availableFrom !== availableFromDate)
      const availabilityStatusChanged = existingProfile.availabilityStatus !== availabilityStatus
      const availabilityWasExplicitlyConfirmed =
        availabilityStatusChanged && availabilityStatus !== 'NOT_AVAILABLE'

      // Actualizar perfil existente
      const updatedProfile = await prisma.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          fullName: validatedData.fullName,
          birthDate: birthDateObj,
          role: session.user.role,
          city: validatedData.city,
          country: validatedData.country?.trim() || existingProfile.country,
          position: validatedData.position || null,
          secondaryPosition: validatedData.secondaryPosition || null,
          height: heightCm,
          weight: weightKg,
          wingspan: wingspanCm,
          dominantHand: validatedData.dominantHand || null,
          currentLevel: validatedData.currentLevel || null,
          lastTeam: validatedData.lastTeam || null,
          currentCategory: validatedData.currentCategory || null,
          playingStyle: validatedData.playingStyle ? JSON.stringify(validatedData.playingStyle) : null,
          languages: validatedData.languages ? JSON.stringify(validatedData.languages) : null,
          willingToTravel: validatedData.willingToTravel || false,
          weeklyCommitment: weeklyCommitmentNum,
          internationalExperience: validatedData.internationalExperience || false,
          hasLicense: validatedData.hasLicense || false,
          injuryHistory: validatedData.injuryHistory || null,
          currentGoal: validatedData.currentGoal || null,
          nationality: validatedData.nationality || null,
          euPassportStatus: validatedData.euPassportStatus || 'NOT_PROVIDED',
          targetCountries,
          relocationPreference: validatedData.relocationPreference || 'NOT_PROVIDED',
          isStudent: validatedData.isStudent ?? null,
          bio: validatedData.bio || null,
          availabilityStatus,
          availableFrom: availableFromDate,
          availabilityUpdatedAt: availabilityChanged ? new Date() : existingProfile.availabilityUpdatedAt,
          availabilityConfirmedAt: availabilityWasExplicitlyConfirmed ? new Date() : existingProfile.availabilityConfirmedAt,
          videoUrl: validatedData.videoUrl || null,
          fullGameUrl: validatedData.fullGameUrl || null,
          socialUrl: validatedData.socialUrl || null,
          photoUrls: validatedData.photoUrls ? JSON.stringify(validatedData.photoUrls) : null,
          profileCompletionPercentage,
          isPublic: true  // Asegurar que el perfil sea público
        }
      })

      // Actualizar o crear PlayerSkills
      await prisma.playerSkills.upsert({
        where: { talentProfileId: updatedProfile.id },
        create: {
          talentProfileId: updatedProfile.id,
          ...validatedSkills
        },
        update: {
          ...validatedSkills
        }
      })

      if (availabilityChanged && availabilityStatus !== 'NOT_AVAILABLE') {
        await trackFunnelEvent({
          eventName: 'availability_enabled',
          userId: session.user.id,
          role: session.user.role,
          metadata: {
            profileId: updatedProfile.id,
            availabilityStatus
          }
        })
      }

      // Send profile completed email if 100% (non-blocking)
      if (profileCompletionPercentage === 100 && existingProfile.profileCompletionPercentage < 100) {
        try {
          const user = await prisma.user.findUnique({ where: { id: session.user.id } })
          if (user) {
            const { sendProfileCompletedEmail } = await import('@/lib/email')
            const profileUrl = `${process.env.APP_URL}/talento/perfiles/${updatedProfile.id}`
            await sendProfileCompletedEmail(user.name!, user.email!, user.role, profileUrl)
            console.log('[PROFILE] Profile completed email sent to:', user.email)
          }
        } catch (emailError) {
          console.error('[PROFILE] Failed to send profile completed email:', emailError)
        }
      }

      return NextResponse.json({ 
        success: true,
        profile: updatedProfile,
        message: 'Perfil actualizado correctamente'
      })
    } else {
      // Crear nuevo perfil
      const newProfile = await prisma.talentProfile.create({
        data: {
          userId: session.user.id,
          fullName: validatedData.fullName,
          birthDate: birthDateObj,
          role: session.user.role,
          city: validatedData.city,
          country: validatedData.country?.trim() || '',
          position: validatedData.position || null,
          secondaryPosition: validatedData.secondaryPosition || null,
          height: heightCm,
          weight: weightKg,
          wingspan: wingspanCm,
          dominantHand: validatedData.dominantHand || null,
          currentLevel: validatedData.currentLevel || null,
          lastTeam: validatedData.lastTeam || null,
          currentCategory: validatedData.currentCategory || null,
          playingStyle: validatedData.playingStyle ? JSON.stringify(validatedData.playingStyle) : null,
          languages: validatedData.languages ? JSON.stringify(validatedData.languages) : null,
          willingToTravel: validatedData.willingToTravel || false,
          weeklyCommitment: weeklyCommitmentNum,
          internationalExperience: validatedData.internationalExperience || false,
          hasLicense: validatedData.hasLicense || false,
          injuryHistory: validatedData.injuryHistory || null,
          currentGoal: validatedData.currentGoal || null,
          nationality: validatedData.nationality || null,
          euPassportStatus: validatedData.euPassportStatus || 'NOT_PROVIDED',
          targetCountries,
          relocationPreference: validatedData.relocationPreference || 'NOT_PROVIDED',
          isStudent: validatedData.isStudent ?? null,
          bio: validatedData.bio || null,
          availabilityStatus,
          availableFrom: availableFromDate,
          availabilityUpdatedAt: new Date(),
          // The default status is not treated as an explicit availability confirmation.
          availabilityConfirmedAt:
            validatedData.availabilityConfirmationRequested && availabilityStatus !== 'NOT_AVAILABLE'
              ? new Date()
              : null,
          videoUrl: validatedData.videoUrl || null,
          fullGameUrl: validatedData.fullGameUrl || null,
          socialUrl: validatedData.socialUrl || null,
          photoUrls: validatedData.photoUrls ? JSON.stringify(validatedData.photoUrls) : null,
          profileCompletionPercentage,
          isPublic: true  // Asegurar que el perfil sea público
        }
      })

      // Crear PlayerSkills
      await prisma.playerSkills.create({
        data: {
          talentProfileId: newProfile.id,
          ...validatedSkills
        }
      })

      await trackFunnelEvent({
        eventName: 'profile_created',
        userId: session.user.id,
        role: session.user.role,
        metadata: {
          profileId: newProfile.id,
          profileRole: session.user.role
        }
      })

      if (availabilityStatus !== 'NOT_AVAILABLE') {
        await trackFunnelEvent({
          eventName: 'availability_enabled',
          userId: session.user.id,
          role: session.user.role,
          metadata: {
            profileId: newProfile.id,
            availabilityStatus
          }
        })
      }

      // Send profile completed email if 100% (non-blocking)
      if (profileCompletionPercentage === 100) {
        try {
          const user = await prisma.user.findUnique({ where: { id: session.user.id } })
          if (user) {
            const { sendProfileCompletedEmail } = await import('@/lib/email')
            const profileUrl = `${process.env.APP_URL}/talento/perfiles/${newProfile.id}`
            await sendProfileCompletedEmail(user.name!, user.email!, user.role, profileUrl)
            console.log('[PROFILE] Profile completed email sent to:', user.email)
          }
        } catch (emailError) {
          console.error('[PROFILE] Failed to send profile completed email:', emailError)
        }
      }

      return NextResponse.json({ 
        success: true,
        profile: newProfile,
        message: 'Perfil creado correctamente'
      })
    }
  } catch (error: any) {
    console.error('Error in profile-onboarding:', error)

    if (error instanceof Error && error.message.includes('debe estar entre')) {
      return NextResponse.json({
        error: 'Datos inválidos',
        message: error.message
      }, { status: 400 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Error al guardar el perfil',
      message: error.message
    }, { status: 500 })
  }
}
