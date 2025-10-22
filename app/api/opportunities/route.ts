import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const opportunityCreateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  type: z.string(),
  level: z.string(),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  city: z.string(),
  country: z.string().default('España'),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  remunerationMin: z.string().optional(),
  remunerationMax: z.string().optional(),
  remunerationType: z.string().default('mensual'),
  contactEmail: z.string().email('Email de contacto inválido'),
  contactPhone: z.string().optional(),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  featured: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 12
    const skip = (page - 1) * limit

    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'publicada',
        publishedAt: { not: null },
      },
      include: {
        organization: {
          select: {
            name: true,
            verified: true,
          }
        },
        author: {
          select: {
            name: true,
          }
        },
        _count: {
          select: {
            applications: true,
            favorites: true,
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit,
    })

    const total = await prisma.opportunity.count({
      where: {
        status: 'publicada',
        publishedAt: { not: null },
      },
    })

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { message: 'Error fetching opportunities', error: error.message },
      { status: 500 }
    )
  }
}