import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación para el onboarding
const profileOnboardingSchema = z.object({
  // Paso 1: Datos técnicos
  fullName: z.string().min(1, 'Nombre completo es requerido'),
  birthDate: z.string().min(1, 'Fecha de nacimiento es requerida'),
  city: z.string().min(1, 'Ciudad es requerida'),
  position: z.string().min(1, 'Posición es requerida'),
  secondaryPosition: z.string().optional(),
  height: z.union([z.string(), z.number()]).optional(),
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
  }),
  
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
    const heightCm = validatedData.height ? parseInt(validatedData.height.toString()) : null
    const weightKg = validatedData.weight ? parseInt(validatedData.weight.toString()) : null
    const wingspanCm = validatedData.wingspan ? parseInt(validatedData.wingspan.toString()) : null
    const weeklyCommitmentNum = validatedData.weeklyCommitment ? parseInt(validatedData.weeklyCommitment.toString()) : null

    // Convertir birthDate a DateTime
    const birthDateObj = new Date(validatedData.birthDate)

    // Calculate profile completion percentage - weighted by importance
    const weightedFields = [
      { value: validatedData.fullName, weight: 10 },
      { value: validatedData.birthDate, weight: 10 },
      { value: validatedData.city, weight: 10 },
      { value: validatedData.position, weight: 10 },
      { value: validatedData.height, weight: 5 },
      { value: validatedData.weight, weight: 5 },
      { value: validatedData.currentLevel, weight: 8 },
      { value: validatedData.bio, weight: 10 },
      { value: validatedData.videoUrl, weight: 10 },
      { value: validatedData.currentGoal, weight: 10 },
      { value: validatedData.secondaryPosition, weight: 3 },
      { value: validatedData.playingStyle && validatedData.playingStyle.length > 0, weight: 7 },
      { value: validatedData.languages && validatedData.languages.length > 0, weight: 5 },
      { value: validatedData.fullGameUrl, weight: 5 },
      { value: validatedData.socialUrl, weight: 2 }
    ]
    
    const totalWeight = weightedFields.reduce((sum, field) => sum + field.weight, 0)
    const filledWeight = weightedFields.reduce((sum, field) => {
      return sum + (field.value ? field.weight : 0)
    }, 0)
    const profileCompletionPercentage = Math.round((filledWeight / totalWeight) * 100)

    // Buscar perfil existente
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      // Actualizar perfil existente
      const updatedProfile = await prisma.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          fullName: validatedData.fullName,
          birthDate: birthDateObj,
          role: session.user.role,
          city: validatedData.city,
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
          bio: validatedData.bio || null,
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
          ...validatedData.skills
        },
        update: {
          ...validatedData.skills
        }
      })

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
          bio: validatedData.bio || null,
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
          ...validatedData.skills
        }
      })

      return NextResponse.json({ 
        success: true,
        profile: newProfile,
        message: 'Perfil creado correctamente'
      })
    }
  } catch (error: any) {
    console.error('Error in profile-onboarding:', error)

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
