import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const opportunityUpdateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  type: z.string().min(1, 'El tipo es requerido'),
  level: z.string().min(1, 'El nivel es requerido'),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().default('España'),
  deadline: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  remunerationMin: z.string().optional().or(z.literal('')),
  remunerationMax: z.string().optional().or(z.literal('')),
  remunerationType: z.string().default('mensual'),
  contactEmail: z.string().email('Email de contacto inválido'),
  contactPhone: z.string().optional().or(z.literal('')),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  benefits: z.string().optional().or(z.literal(''))
})

// GET single opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!opportunity) {
      return NextResponse.json(
        { message: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(opportunity)

  } catch (error) {
    console.error('Error fetching opportunity:', error)
    return NextResponse.json(
      { message: 'Error al obtener la oportunidad' },
      { status: 500 }
    )
  }
}

// PUT update opportunity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    // Check if user is club or agency
    if (session.user.role !== 'club' && session.user.role !== 'agencia') {
      return NextResponse.json(
        { message: 'Solo clubs y agencias pueden editar ofertas' },
        { status: 403 }
      )
    }

    // Check if opportunity exists and belongs to user
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id: params.id }
    })

    if (!existingOpportunity) {
      return NextResponse.json(
        { message: 'Oportunidad no encontrada' },
        { status: 404 }
      )
    }

    if (existingOpportunity.authorId !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para editar esta oferta' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Updating opportunity with data:', JSON.stringify(body, null, 2))
    
    const validatedData = opportunityUpdateSchema.parse(body)

    // Convert empty strings to null for optional date fields
    const updateData: any = {
      ...validatedData,
      deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      remunerationMin: validatedData.remunerationMin || null,
      remunerationMax: validatedData.remunerationMax || null,
      contactPhone: validatedData.contactPhone || null,
      applicationUrl: validatedData.applicationUrl || null,
      benefits: validatedData.benefits || null,
      type: validatedData.type as any,
      level: validatedData.level as any,
      remunerationType: validatedData.remunerationType as any
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Oportunidad actualizada exitosamente',
      opportunity: updatedOpportunity
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json(
        { 
          message: 'Datos inválidos', 
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    console.error('Error updating opportunity:', error)
    return NextResponse.json(
      { message: 'Error al actualizar la oportunidad', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
