import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  // 1. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@workhoops.es' },
    update: {},
    create: {
      email: 'admin@workhoops.es',
      name: 'Carlos Martínez',
      role: 'admin',
      planType: 'pro_semipro',
      verified: true,
    }
  })

  // 2. Create Test Users
  const jugadorUser = await prisma.user.upsert({
    where: { email: 'jugador@ejemplo.es' },
    update: {},
    create: {
      email: 'jugador@ejemplo.es', 
      name: 'Ana García',
      role: 'jugador',
      planType: 'free_amateur',
      verified: false,
    }
  })

  const entrenadorUser = await prisma.user.upsert({
    where: { email: 'entrenador@ejemplo.es' },
    update: {},
    create: {
      email: 'entrenador@ejemplo.es',
      name: 'Miguel Torres', 
      role: 'entrenador',
      planType: 'free_amateur',
      verified: false,
    }
  })

  const clubUser = await prisma.user.upsert({
    where: { email: 'club@fcbarcelona.es' },
    update: {},
    create: {
      email: 'club@fcbarcelona.es',
      name: 'Club Barcelona Basket',
      role: 'club',
      planType: 'club_agencia',
      verified: true,
    }
  })

  // 3. Create Organizations
  const fcbOrganization = await prisma.organization.upsert({
    where: { slug: 'fc-barcelona-basket' },
    update: {},
    create: {
      name: 'FC Barcelona Basket',
      slug: 'fc-barcelona-basket',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200',
      description: 'Club de baloncesto profesional con sede en Barcelona, parte del FC Barcelona. Compitiendo en la Liga Endesa ACB.',
      website: 'https://www.fcbarcelona.es/es/baloncesto',
      verified: true,
      ownerId: clubUser.id,
    }
  })

  const rmOrganization = await prisma.organization.upsert({
    where: { slug: 'real-madrid-baloncesto' },
    update: {},
    create: {
      name: 'Real Madrid Baloncesto',
      slug: 'real-madrid-baloncesto',
      logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
      description: 'Club de baloncesto del Real Madrid Club de Fútbol, compitiendo en la Liga Endesa ACB y Euroliga.',
      website: 'https://www.realmadrid.com/baloncesto',
      verified: true,
    }
  })

  // 4. Create Opportunities
  const opportunity1 = await prisma.opportunity.upsert({
    where: { slug: 'jugador-base-cantera-fc-barcelona' },
    update: {},
    create: {
      title: 'Jugador Base - Cantera FC Barcelona',
      slug: 'jugador-base-cantera-fc-barcelona',
      description: `## Descripción del puesto

El FC Barcelona Basket busca un jugador base para su cantera masculina U16. Una excelente oportunidad para formar parte de una de las mejores canteras del baloncesto español.

### Responsabilidades principales:
- Dirección del juego durante entrenamientos y partidos
- Participación en competiciones autonómicas y nacionales  
- Formación integral académica y deportiva
- Seguimiento del progreso académico

### Requisitos imprescindibles:
- Edad: 15-16 años
- Experiencia previa en baloncesto federado
- Nivel académico exigente (mínimo 7/10)
- Residencia en Barcelona o alrededores
- Disponibilidad para entrenamientos diarios

### Se valorará:
- Experiencia en torneos nacionales
- Conocimientos básicos de inglés
- Actitud de liderazgo y trabajo en equipo`,
      type: 'empleo',
      organizationId: fcbOrganization.id,
      status: 'publicada',
      level: 'cantera',
      city: 'Barcelona',
      country: 'España',
      latitude: 41.3851,
      longitude: 2.1734,
      modality: 'presencial',
      remunerationType: 'annual',
      remunerationMin: 15000,
      remunerationMax: 25000,
      currency: 'EUR',
      benefits: `**Beneficios incluidos:**
- Seguro médico completo
- Material deportivo oficial
- Formación académica en centro concertado
- Formación continua en metodologías de entrenamiento
- Posibilidad de progresión al primer equipo`,
      publishedAt: new Date(),
      tags: 'jugador,base,cantera,barcelona,masculino,u16',
      verified: true,
      contactEmail: 'cantera@fcbarcelona.es',
      authorId: clubUser.id
    }
  })

  const opportunity2 = await prisma.opportunity.upsert({
    where: { slug: 'entrenador-asistente-real-madrid' },
    update: {},
    create: {
      title: 'Entrenador Asistente - Real Madrid',
      slug: 'entrenador-asistente-real-madrid',
      description: `## Oportunidad Profesional

El Real Madrid Baloncesto busca un entrenador asistente para el primer equipo. Una oportunidad única para formar parte del staff técnico de uno de los mejores equipos de Europa.

### Funciones principales:
- Asistencia en entrenamientos del primer equipo
- Análisis de video de rivales y propio equipo  
- Preparación específica de jugadores
- Colaboración en la planificación táctica

### Requisitos:
- Título de Entrenador Superior de Baloncesto
- Experiencia mínima de 5 años en baloncesto profesional
- Dominio de inglés y español
- Disponibilidad total para viajes y competiciones`,
      type: 'empleo',
      organizationId: rmOrganization.id,
      status: 'publicada',
      level: 'pro',
      city: 'Madrid',
      country: 'España',
      latitude: 40.4168,
      longitude: -3.7038,
      modality: 'presencial',
      remunerationType: 'annual',
      remunerationMin: 45000,
      remunerationMax: 65000,
      currency: 'EUR',
      benefits: 'Seguro médico, formación continua, material técnico',
      publishedAt: new Date(),
      tags: 'entrenador,asistente,madrid,profesional,euroliga',
      verified: true,
      contactEmail: 'rrhh@realmadrid.com',
      authorId: clubUser.id
    }
  })

  const opportunity3 = await prisma.opportunity.upsert({
    where: { slug: 'pruebas-abiertas-valencia-basket' },
    update: {},
    create: {
      title: 'Pruebas Abiertas - Valencia Basket',
      slug: 'pruebas-abiertas-valencia-basket',
      description: `## Pruebas Abiertas Femenino Senior

Valencia Basket organiza pruebas abiertas para la temporada 2024-2025. Buscamos talento femenino para completar la plantilla de LF2.

### Información de las pruebas:
- **Fecha:** 15 de septiembre de 2024
- **Horario:** 10:00 - 14:00h  
- **Lugar:** Pabellón Municipal de Valencia
- **Dirigido a:** Jugadoras entre 18-28 años

### Requisitos para participar:
- Experiencia demostrable en liga autonómica o superior
- Altura mínima recomendada: 1.70m
- Certificado médico deportivo en vigor
- Seguro deportivo actualizado

**Inscripción gratuita hasta el 10 de septiembre**`,
      type: 'prueba',
      status: 'publicada',
      level: 'semi_pro',
      city: 'Valencia',
      country: 'España',
      latitude: 39.4699,
      longitude: -0.3763,
      modality: 'presencial',
      publishedAt: new Date(),
      tags: 'prueba,femenino,valencia,senior,lf2',
      verified: true,
      contactEmail: 'pruebas@valenciabasket.es',
      authorId: entrenadorUser.id
    }
  })

  console.log('✅ Seeding completed successfully!')
  console.log(`- Users: 4 (1 admin, 1 jugador, 1 entrenador, 1 club)`)
  console.log(`- Organizations: 2 (FC Barcelona, Real Madrid)`)
  console.log(`- Opportunities: 3 (2 published, 1 prueba)`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })