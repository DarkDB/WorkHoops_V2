import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const clubAgencyProfileSchema = z.object({
  organizationName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  organizationType: z.enum(['club', 'agencia', 'escuela', 'federacion']),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  description: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  country: z.string().default('España'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().optional().nullable(),
  categories: z.array(z.string()).default([]),
  divisions: z.array(z.string()).default([]),
  contactPerson: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  facilities: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
})

// GET - Fetch club/agency profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Only clubs and agencies can have this profile
    if (session.user.role !== 'club' && session.user.role !== 'agencia') {
      return NextResponse.json(
        { message: 'Solo clubs y agencias pueden tener este perfil' },
        { status: 403 }
      )
    }

    const profile = await prisma.clubAgencyProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json(
        { message: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Error fetching club/agency profile:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create or update club/agency profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Only clubs and agencies can create this profile
    if (session.user.role !== 'club' && session.user.role !== 'agencia') {
      return NextResponse.json(
        { message: 'Solo clubs y agencias pueden crear este perfil' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = clubAgencyProfileSchema.parse(body)

    // Check if profile already exists
    const existingProfile = await prisma.clubAgencyProfile.findUnique({
      where: { userId: session.user.id }
    })

    let profile

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.clubAgencyProfile.update({
        where: { userId: session.user.id },
        data: validatedData
      })
    } else {
      // Create new profile
      profile = await prisma.clubAgencyProfile.create({
        data: {
          ...validatedData,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: existingProfile ? 'Perfil actualizado correctamente' : 'Perfil creado correctamente',
      profile
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating/updating club/agency profile:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
