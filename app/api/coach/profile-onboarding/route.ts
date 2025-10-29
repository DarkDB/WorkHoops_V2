import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const coachProfileSchema = z.object({
  fullName: z.string().optional(),
  birthYear: z.number().nullable().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  city: z.string().optional(),
  willingToRelocate: z.boolean().optional(),
  currentLevel: z.string().optional(),
  federativeLicense: z.string().optional(),
  totalExperience: z.number().nullable().optional(),
  
  currentClub: z.string().optional(),
  previousClubs: z.string().optional(),
  categoriesCoached: z.array(z.string()).optional(),
  achievements: z.string().optional(),
  internationalExp: z.boolean().optional(),
  internationalExpDesc: z.string().optional(),
  roleExperience: z.string().optional(),
  nationalTeamExp: z.boolean().optional(),
  
  trainingPlanning: z.number().min(1).max(5).default(3),
  individualDevelopment: z.number().min(1).max(5).default(3),
  offensiveTactics: z.number().min(1).max(5).default(3),
  defensiveTactics: z.number().min(1).max(5).default(3),
  groupManagement: z.number().min(1).max(5).default(3),
  scoutingAnalysis: z.number().min(1).max(5).default(3),
  staffManagement: z.number().min(1).max(5).default(3),
  communication: z.number().min(1).max(5).default(3),
  tacticalAdaptability: z.number().min(1).max(5).default(3),
  digitalTools: z.number().min(1).max(5).default(3),
  physicalPreparation: z.number().min(1).max(5).default(3),
  youthDevelopment: z.number().min(1).max(5).default(3),
  
  playingStyle: z.array(z.string()).optional(),
  workPriority: z.string().optional(),
  playerTypePreference: z.string().optional(),
  inspirations: z.string().optional(),
  
  academicDegrees: z.string().optional(),
  certifications: z.string().optional(),
  coursesAttended: z.string().optional(),
  videoUrl: z.string().optional(),
  presentationsUrl: z.string().optional(),
  
  currentGoal: z.string().optional(),
  offerType: z.string().optional(),
  availability: z.string().optional(),
  leadership: z.number().min(1).max(5).default(3),
  teamwork: z.number().min(1).max(5).default(3),
  conflictResolution: z.number().min(1).max(5).default(3),
  organization: z.number().min(1).max(5).default(3),
  adaptability: z.number().min(1).max(5).default(3),
  innovation: z.number().min(1).max(5).default(3),
  bio: z.string().optional(),
  
  currentStep: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'entrenador') {
      return NextResponse.json({ error: 'Solo entrenadores pueden completar este perfil' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = coachProfileSchema.parse(body)

    // Calculate profile completion percentage
    const completionFields = [
      validatedData.fullName,
      validatedData.city,
      validatedData.currentLevel,
      validatedData.totalExperience,
      validatedData.achievements,
      validatedData.bio,
      validatedData.videoUrl,
      validatedData.currentGoal
    ]
    const filledFields = completionFields.filter(f => f && f !== '').length
    const profileCompletionPercentage = Math.round((filledFields / completionFields.length) * 100)

    // Check if profile exists
    const existingProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id }
    })

    const profileData = {
      fullName: validatedData.fullName || '',
      birthYear: validatedData.birthYear || null,
      nationality: validatedData.nationality || 'España',
      languages: validatedData.languages ? JSON.stringify(validatedData.languages) : null,
      city: validatedData.city || '',
      willingToRelocate: validatedData.willingToRelocate || false,
      currentLevel: validatedData.currentLevel || null,
      federativeLicense: validatedData.federativeLicense || null,
      totalExperience: validatedData.totalExperience || null,
      
      currentClub: validatedData.currentClub || null,
      previousClubs: validatedData.previousClubs || null,
      categoriesCoached: validatedData.categoriesCoached ? JSON.stringify(validatedData.categoriesCoached) : null,
      achievements: validatedData.achievements || null,
      internationalExp: validatedData.internationalExp || false,
      internationalExpDesc: validatedData.internationalExpDesc || null,
      roleExperience: validatedData.roleExperience || null,
      nationalTeamExp: validatedData.nationalTeamExp || false,
      
      trainingPlanning: validatedData.trainingPlanning,
      individualDevelopment: validatedData.individualDevelopment,
      offensiveTactics: validatedData.offensiveTactics,
      defensiveTactics: validatedData.defensiveTactics,
      groupManagement: validatedData.groupManagement,
      scoutingAnalysis: validatedData.scoutingAnalysis,
      staffManagement: validatedData.staffManagement,
      communication: validatedData.communication,
      tacticalAdaptability: validatedData.tacticalAdaptability,
      digitalTools: validatedData.digitalTools,
      physicalPreparation: validatedData.physicalPreparation,
      youthDevelopment: validatedData.youthDevelopment,
      
      playingStyle: validatedData.playingStyle ? JSON.stringify(validatedData.playingStyle) : null,
      workPriority: validatedData.workPriority || null,
      playerTypePreference: validatedData.playerTypePreference || null,
      inspirations: validatedData.inspirations || null,
      
      academicDegrees: validatedData.academicDegrees || null,
      certifications: validatedData.certifications || null,
      coursesAttended: validatedData.coursesAttended || null,
      videoUrl: validatedData.videoUrl || null,
      presentationsUrl: validatedData.presentationsUrl || null,
      
      currentGoal: validatedData.currentGoal || null,
      offerType: validatedData.offerType || null,
      availability: validatedData.availability || null,
      leadership: validatedData.leadership,
      teamwork: validatedData.teamwork,
      conflictResolution: validatedData.conflictResolution,
      organization: validatedData.organization,
      adaptability: validatedData.adaptability,
      innovation: validatedData.innovation,
      bio: validatedData.bio || null,
      
      profileCompletionPercentage
    }

    if (existingProfile) {
      const updatedProfile = await prisma.coachProfile.update({
        where: { userId: session.user.id },
        data: profileData
      })

      return NextResponse.json({ 
        success: true,
        profile: updatedProfile,
        message: 'Perfil actualizado correctamente'
      })
    } else {
      const newProfile = await prisma.coachProfile.create({
        data: {
          userId: session.user.id,
          ...profileData
        }
      })

      return NextResponse.json({ 
        success: true,
        profile: newProfile,
        message: 'Perfil creado correctamente'
      })
    }
  } catch (error: any) {
    console.error('Error in coach profile-onboarding:', error)

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
