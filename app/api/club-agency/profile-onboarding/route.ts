import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clubAgencyProfileOnboardingSchema = z.object({
  legalName: z.string().optional(),
  commercialName: z.string().optional(),
  entityType: z.string().optional(),
  foundedYear: z.number().nullable().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  competitions: z.array(z.string()).optional(),
  sections: z.array(z.string()).optional(),
  rosterSize: z.number().nullable().optional(),
  staffSize: z.number().nullable().optional(),
  workingLanguages: z.array(z.string()).optional(),
  description: z.string().optional(),
  
  contactPerson: z.string().optional(),
  contactRole: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactPreference: z.string().optional(),
  website: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  showEmailPublic: z.boolean().optional(),
  showPhonePublic: z.boolean().optional(),
  candidatesViaPortal: z.boolean().optional(),
  fiscalDocument: z.string().optional(),
  
  profilesNeeded: z.array(z.string()).optional(),
  ageRangeMin: z.number().nullable().optional(),
  ageRangeMax: z.number().nullable().optional(),
  experienceRequired: z.string().optional(),
  keySkills: z.array(z.string()).optional(),
  competitiveReqs: z.string().optional(),
  availabilityNeeded: z.string().optional(),
  scoutingNotes: z.string().optional(),
  
  salaryRange: z.string().optional(),
  housingProvided: z.boolean().optional(),
  mealsTransport: z.boolean().optional(),
  medicalInsurance: z.boolean().optional(),
  visaSupport: z.boolean().optional(),
  contractType: z.string().optional(),
  requiredDocs: z.string().optional(),
  agentPolicy: z.string().optional(),
  
  logo: z.string().optional(),
  facilityPhotos: z.array(z.string()).optional(),
  facilityPhotosInput: z.string().optional(),
  institutionalVideo: z.string().optional(),
  requestVerification: z.boolean().optional(),
  
  currentStep: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'club' && session.user.role !== 'agencia') {
      return NextResponse.json({ error: 'Solo clubs y agencias pueden completar este perfil' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = clubAgencyProfileOnboardingSchema.parse(body)

    // Calculate profile completion percentage
    const completionFields = [
      validatedData.legalName,
      validatedData.entityType,
      validatedData.city,
      validatedData.contactEmail,
      validatedData.description,
      validatedData.logo,
      validatedData.profilesNeeded && validatedData.profilesNeeded.length > 0,
      validatedData.scoutingNotes
    ]
    const filledFields = completionFields.filter(f => f && f !== '').length
    const profileCompletionPercentage = Math.round((filledFields / completionFields.length) * 100)

    // Check if profile exists
    const existingProfile = await prisma.clubAgencyProfile.findUnique({
      where: { userId: session.user.id }
    })

    const profileData = {
      legalName: validatedData.legalName || '',
      commercialName: validatedData.commercialName || null,
      entityType: validatedData.entityType || '',
      foundedYear: validatedData.foundedYear || null,
      country: validatedData.country || 'España',
      province: validatedData.province || null,
      city: validatedData.city || '',
      competitions: validatedData.competitions ? JSON.stringify(validatedData.competitions) : null,
      sections: validatedData.sections ? JSON.stringify(validatedData.sections) : null,
      rosterSize: validatedData.rosterSize || null,
      staffSize: validatedData.staffSize || null,
      workingLanguages: validatedData.workingLanguages ? JSON.stringify(validatedData.workingLanguages) : null,
      description: validatedData.description || null,
      
      contactPerson: validatedData.contactPerson || null,
      contactRole: validatedData.contactRole || null,
      contactEmail: validatedData.contactEmail,
      contactPhone: validatedData.contactPhone || null,
      contactPreference: validatedData.contactPreference || null,
      website: validatedData.website || null,
      instagramUrl: validatedData.instagramUrl || null,
      twitterUrl: validatedData.twitterUrl || null,
      linkedinUrl: validatedData.linkedinUrl || null,
      youtubeUrl: validatedData.youtubeUrl || null,
      showEmailPublic: validatedData.showEmailPublic || false,
      showPhonePublic: validatedData.showPhonePublic || false,
      candidatesViaPortal: validatedData.candidatesViaPortal !== false,
      fiscalDocument: validatedData.fiscalDocument || null,
      
      profilesNeeded: validatedData.profilesNeeded ? JSON.stringify(validatedData.profilesNeeded) : null,
      ageRangeMin: validatedData.ageRangeMin || null,
      ageRangeMax: validatedData.ageRangeMax || null,
      experienceRequired: validatedData.experienceRequired || null,
      keySkills: validatedData.keySkills ? JSON.stringify(validatedData.keySkills) : null,
      competitiveReqs: validatedData.competitiveReqs || null,
      availabilityNeeded: validatedData.availabilityNeeded || null,
      scoutingNotes: validatedData.scoutingNotes || null,
      
      salaryRange: validatedData.salaryRange || null,
      housingProvided: validatedData.housingProvided || false,
      mealsTransport: validatedData.mealsTransport || false,
      medicalInsurance: validatedData.medicalInsurance || false,
      visaSupport: validatedData.visaSupport || false,
      contractType: validatedData.contractType || null,
      requiredDocs: validatedData.requiredDocs || null,
      agentPolicy: validatedData.agentPolicy || null,
      
      logo: validatedData.logo || null,
      facilityPhotos: validatedData.facilityPhotos ? JSON.stringify(validatedData.facilityPhotos) : null,
      institutionalVideo: validatedData.institutionalVideo || null,
      
      profileCompletionPercentage
    }

    if (existingProfile) {
      const updatedProfile = await prisma.clubAgencyProfile.update({
        where: { userId: session.user.id },
        data: profileData
      })

      return NextResponse.json({ 
        success: true,
        profile: updatedProfile,
        message: 'Perfil actualizado correctamente'
      })
    } else {
      const newProfile = await prisma.clubAgencyProfile.create({
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
    console.error('Error in club-agency profile-onboarding:', error)

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
