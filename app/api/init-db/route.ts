import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint temporal para inicializar BD en producción
export async function POST() {
  try {
    // Verificar si ya hay datos
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json({ 
        message: 'Database already initialized',
        users: existingUsers 
      })
    }

    // Crear usuarios básicos
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@workhoops.es',
        name: 'Admin WorkHoops',
        role: 'admin',
        verified: true
      }
    })

    const playerUser = await prisma.user.create({
      data: {
        email: 'jugador@ejemplo.es',
        name: 'Juan Pérez',
        role: 'jugador',
        verified: false
      }
    })

    // Crear organización
    const org = await prisma.organization.create({
      data: {
        name: 'FC Barcelona Basket',
        slug: 'fc-barcelona-basket',
        description: 'Club de baloncesto profesional de Barcelona',
        verified: true,
        ownerId: adminUser.id
      }
    })

    // Crear oportunidad de ejemplo
    const opportunity = await prisma.opportunity.create({
      data: {
        title: 'Jugador Base - Cantera FCB',
        slug: 'jugador-base-cantera-fcb',
        description: 'Buscamos jugador base para nuestra cantera...',
        type: 'prueba',
        level: 'amateur',
        city: 'Barcelona',
        deadline: new Date('2024-12-31'),
        contactEmail: 'cantera@fcbarcelona.es',
        organizationId: org.id,
        authorId: adminUser.id,
        publishedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Database initialized successfully',
      data: {
        users: 2,
        organizations: 1,
        opportunities: 1
      }
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error },
      { status: 500 }
    )
  }
}

// Solo permitir en desarrollo o con clave secreta
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize database',
    endpoint: '/api/init-db'
  })
}