





import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { normalizeOptionalNumber, PHYSICAL_LIMITS, validateNumberRange } from '@/lib/physical-validations'
import { COUNTRY_OPTIONS } from '@/lib/recruiting-preferences'

export const dynamic = 'force-dynamic'

const talentProfileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  birthDate: z.string(),
  role: z.string(),
  city: z.string().min(2, 'La ciudad es requerida'),
  country: z.string().optional(),
  position: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bio: z.string().max(500).optional(),
  video: z.string().url().optional().or(z.literal('')),
  social: z.string().url().optional().or(z.literal('')),
  nationality: z.string().trim().max(100).optional(),
  euPassportStatus: z.enum(['YES', 'NO', 'NOT_PROVIDED']).optional(),
  targetCountries: z.array(z.enum(COUNTRY_OPTIONS)).max(12).optional(),
  relocationPreference: z.enum(['YES', 'DOMESTIC_ONLY', 'STUDIES_ONLY', 'DEPENDS_ON_CONDITIONS', 'NO', 'NOT_PROVIDED']).optional(),
  isStudent: z.boolean().nullable().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'OPEN_TO_OFFERS', 'NOT_AVAILABLE']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión para crear un perfil.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = talentProfileSchema.parse(body)
    const height = normalizeOptionalNumber(validatedData.height)
    const weight = normalizeOptionalNumber(validatedData.weight)
    const targetCountries = Array.from(new Set(validatedData.targetCountries || []))
    validateNumberRange(height, PHYSICAL_LIMITS.height.min, PHYSICAL_LIMITS.height.max, 'La altura')
    validateNumberRange(weight, PHYSICAL_LIMITS.weight.min, PHYSICAL_LIMITS.weight.max, 'El peso')

    // Check if user already has a talent profile
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      const availabilityStatusChanged =
        validatedData.availabilityStatus !== undefined &&
        existingProfile.availabilityStatus !== validatedData.availabilityStatus
      // Update existing profile
      const updatedProfile = await prisma.talentProfile.update({
        where: { userId: session.user.id },
        data: {
          fullName: validatedData.fullName,
          birthDate: new Date(validatedData.birthDate),
          role: validatedData.role,
          city: validatedData.city,
          country: validatedData.country?.trim() || existingProfile.country,
          position: validatedData.position || null,
          height,
          weight,
          bio: validatedData.bio || null,
          videoUrl: validatedData.video || null,
          socialUrl: validatedData.social || null,
          ...(validatedData.nationality !== undefined ? { nationality: validatedData.nationality || null } : {}),
          ...(validatedData.euPassportStatus !== undefined ? { euPassportStatus: validatedData.euPassportStatus } : {}),
          ...(validatedData.targetCountries !== undefined ? { targetCountries } : {}),
          ...(validatedData.relocationPreference !== undefined ? { relocationPreference: validatedData.relocationPreference } : {}),
          ...(validatedData.isStudent !== undefined ? { isStudent: validatedData.isStudent } : {}),
          ...(validatedData.availabilityStatus ? {
            availabilityStatus: validatedData.availabilityStatus,
            availabilityConfirmedAt: availabilityStatusChanged && validatedData.availabilityStatus !== 'NOT_AVAILABLE'
              ? new Date()
              : existingProfile.availabilityConfirmedAt
          } : {}),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        profile: updatedProfile
      })
    }

    // Create new talent profile
    const talentProfile = await prisma.talentProfile.create({
      data: {
        fullName: validatedData.fullName,
        birthDate: new Date(validatedData.birthDate),
        role: validatedData.role,
        city: validatedData.city,
        country: validatedData.country?.trim() || '',
        position: validatedData.position || null,
        height,
        weight,
        bio: validatedData.bio || null,
        videoUrl: validatedData.video || null,
        socialUrl: validatedData.social || null,
        nationality: validatedData.nationality || null,
        euPassportStatus: validatedData.euPassportStatus || 'NOT_PROVIDED',
        targetCountries,
        relocationPreference: validatedData.relocationPreference || 'NOT_PROVIDED',
        isStudent: validatedData.isStudent ?? null,
        ...(validatedData.availabilityStatus ? { availabilityStatus: validatedData.availabilityStatus } : {}),
        userId: session.user.id
      }
    })

    // Also update the user's name if different
    if (session.user.name !== validatedData.fullName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.fullName }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil de talento creado exitosamente',
      profile: talentProfile
    }, { status: 201 })

  } catch (error) {
    if (error instanceof Error && error.message.includes('debe estar entre')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating talent profile:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
