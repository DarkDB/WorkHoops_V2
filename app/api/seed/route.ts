import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Iniciando seeding...')

    // Create users
    const admin = await prisma.user.create({
      data: {
        name: 'Carlos Martínez',
        email: 'carlos@workhoops.es',
        role: 'admin',
        planType: 'pro_semipro',
        verified: true,
      }
    })

    const player = await prisma.user.create({
      data: {
        name: 'Ana García',
        email: 'ana@ejemplo.es',
        role: 'jugador',
        planType: 'pro_semipro',
      }
    })

    const club = await prisma.user.create({
      data: {
        name: 'Club Barcelona Basket',
        email: 'info@fcbbasket.com',
        role: 'club',
        planType: 'club_agencia',
        verified: true,
      }
    })

    const coach = await prisma.user.create({
      data: {
        name: 'Miguel Torres',
        email: 'miguel@ejemplo.es',
        role: 'entrenador',
        planType: 'free_amateur',
      }
    })

    // Create organizations
    const fcBarcelona = await prisma.organization.create({
      data: {
        name: 'FC Barcelona Basket',
        slug: 'fc-barcelona-basket',
        description: 'Club profesional de baloncesto de Barcelona',
        website: 'https://www.fcbarcelona.es/basquet',
        verified: true,
        ownerId: club.id,
      }
    })

    const realMadrid = await prisma.organization.create({
      data: {
        name: 'Real Madrid Baloncesto',
        slug: 'real-madrid-baloncesto',
        description: 'Club de baloncesto del Real Madrid',
        website: 'https://www.realmadrid.com/baloncesto',
        verified: true,
        ownerId: admin.id,
      }
    })

    // Create opportunities
    const opportunity1 = await prisma.opportunity.create({
      data: {
        title: 'Jugador Base - Cantera FC Barcelona',
        slug: 'jugador-base-cantera-fc-barcelona',
        description: 'Buscamos jugador base para cantera del FC Barcelona. Excelente oportunidad de formación en uno de los mejores clubes de Europa.',
        type: 'empleo',
        level: 'cantera',
        status: 'publicada',
        city: 'Barcelona',
        country: 'España',
        modality: 'presencial',
        remunerationType: 'monthly',
        remunerationMin: 800,
        remunerationMax: 1200,
        currency: 'EUR',
        benefits: 'Seguro médico, material deportivo, formación académica',
        deadline: new Date('2024-11-15'),
        startDate: new Date('2024-12-01'),
        tags: 'base,cantera,barcelona',
        verified: true,
        contactEmail: 'cantera@fcbarcelona.es',
        contactPhone: '+34 93 496 36 00',
        organizationId: fcBarcelona.id,
        authorId: club.id,
        publishedAt: new Date(),
      }
    })

    const opportunity2 = await prisma.opportunity.create({
      data: {
        title: 'Entrenador Asistente - Real Madrid',
        slug: 'entrenador-asistente-real-madrid',
        description: 'Oportunidad única para trabajar como entrenador asistente en el Real Madrid. Experiencia previa requerida.',
        type: 'empleo',
        level: 'profesional',
        status: 'publicada',
        city: 'Madrid',
        country: 'España',
        modality: 'presencial',
        remunerationType: 'annual',
        remunerationMin: 25000,
        remunerationMax: 35000,
        currency: 'EUR',
        benefits: 'Formación continua, seguro médico, equipamiento',
        deadline: new Date('2024-10-20'),
        startDate: new Date('2024-11-01'),
        tags: 'entrenador,asistente,madrid,profesional',
        verified: true,
        contactEmail: 'rrhh@realmadrid.com',
        organizationId: realMadrid.id,
        authorId: admin.id,
        publishedAt: new Date(),
      }
    })

    const opportunity3 = await prisma.opportunity.create({
      data: {
        title: 'Pruebas Abiertas - Valencia Basket',
        slug: 'pruebas-abiertas-valencia-basket',
        description: 'Pruebas abiertas para jugadores de todas las categorías. Ven a demostrar tu talento.',
        type: 'prueba',
        level: 'amateur',
        status: 'publicada',
        city: 'Valencia',
        country: 'España',
        modality: 'presencial',
        remunerationType: 'none',
        benefits: 'Oportunidad de fichar con el club',
        deadline: new Date('2024-10-15'),
        startDate: new Date('2024-10-18'),
        endDate: new Date('2024-10-18'),
        tags: 'pruebas,valencia,amateur',
        verified: true,
        contactEmail: 'pruebas@valenciabasket.com',
        authorId: admin.id,
        publishedAt: new Date(),
      }
    })

    // Create application
    const application = await prisma.application.create({
      data: {
        message: 'Estoy muy interesado en formar parte de la cantera del FC Barcelona. Tengo experiencia jugando como base.',
        state: 'pendiente',
        opportunityId: opportunity1.id,
        userId: player.id,
      }
    })

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        opportunityId: opportunity2.id,
        userId: coach.id,
      }
    })

    return NextResponse.json({
      message: '✅ Seeding completado exitosamente',
      data: {
        users: 4,
        organizations: 2,
        opportunities: 3,
        applications: 1,
        favorites: 1,
        testAccounts: [
          'carlos@workhoops.es (admin)',
          'ana@ejemplo.es (jugador)',
          'info@fcbbasket.com (club)',
          'miguel@ejemplo.es (entrenador)',
        ]
      }
    })

  } catch (error) {
    console.error('❌ Error en seeding:', error)
    return NextResponse.json(
      { message: 'Error en seeding', error: error.message },
      { status: 500 }
    )
  }
}