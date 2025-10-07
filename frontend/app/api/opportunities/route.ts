import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
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