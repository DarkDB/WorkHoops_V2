import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@workhoops.es' },
    update: {},
    create: {
      email: 'admin@workhoops.es',
      name: 'WorkHoops Admin',
      role: 'admin',
      verified: true,
      locale: 'es'
    }
  })

  const orgUser = await prisma.user.upsert({
    where: { email: 'fcbarcelona@workhoops.es' },
    update: {},
    create: {
      email: 'fcbarcelona@workhoops.es',
      name: 'FC Barcelona Basquet',
      role: 'org',
      verified: true,
      locale: 'es'
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'jugador@workhoops.es' },
    update: {},
    create: {
      email: 'jugador@workhoops.es',
      name: 'Marc González',
      role: 'user',
      verified: true,
      locale: 'es'
    }
  })

  console.log('✅ Users created')

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'fc-barcelona-basquet' },
    update: {},
    create: {
      name: 'FC Barcelona Basquet',
      slug: 'fc-barcelona-basquet',
      ownerId: orgUser.id,
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200',
      description: 'Club de baloncesto profesional con sede en Barcelona, parte del FC Barcelona. Compitiendo en la Liga Endesa ACB.',
      verified: true
    }
  })

  console.log('✅ Organization created')

  // Create opportunities
  const opportunity1 = await prisma.opportunity.upsert({
    where: { slug: 'entrenador-cantera-masculina-u16-barcelona' },
    update: {},
    create: {
      title: 'Entrenador Cantera Masculina U16',
      slug: 'entrenador-cantera-masculina-u16-barcelona',
      type: 'empleo',
      organizationId: organization.id,
      status: 'publicada',
      level: 'cantera',
      city: 'Barcelona',
      country: 'España',
      latitude: 41.3851,
      longitude: 2.1734,
      modality: 'presencial',
      remunerationType: 'annual',
      remunerationMin: 30000,
      remunerationMax: 40000,
      currency: 'EUR',
      benefits: `**Beneficios incluidos:**
- Seguro médico completo
- Formación continua en metodologías de entrenamiento
- Material deportivo oficial del club
- Acceso a instalaciones de primer nivel`,
      description: `## Sobre el puesto

Buscamos un entrenador experimentado y apasionado para dirigir nuestro equipo U16 masculino. El candidato ideal tendrá experiencia previa en cantera y un enfoque moderno del desarrollo de jóvenes talentos.

## Responsabilidades principales

- Planificación y ejecución de entrenamientos técnicos y tácticos
- Desarrollo individual y colectivo de los jugadores
- Participación activa en la competición de Liga Autonómica
- Colaboración estrecha con el cuerpo técnico del club
- Seguimiento del progreso académico de los jugadores

**Requisitos imprescindibles:**
- Título de Entrenador Superior de Baloncesto
- Experiencia mínima de 3 años entrenando cantera
- Nivel de inglés conversacional
- Disponibilidad para entrenamientos tarde/noche
- Residencia en Barcelona o alrededores

**Se valorará:**
- Experiencia previa en clubs profesionales
- Formación en psicología deportiva
- Conocimientos de análisis video`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      publishedAt: new Date(),
      tags: 'entrenador,cantera,barcelona,masculino,u16',
      verified: true,
      contactEmail: 'rrhh@fcbarcelona.es',
      authorId: orgUser.id
    }
  })

  const opportunity2 = await prisma.opportunity.upsert({
    where: { slug: 'pruebas-equipo-femenino-senior-valencia' },
    update: {},
    create: {
      title: 'Pruebas Equipo Femenino Senior',
      slug: 'pruebas-equipo-femenino-senior-valencia',
      type: 'prueba',
      organizationId: organization.id,
      status: 'publicada',
      level: 'semi_pro',
      city: 'Valencia',
      country: 'España',
      latitude: 39.4699,
      longitude: -0.3763,
      modality: 'presencial',
      benefits: `**Lo que ofrecemos:**
- Seguro deportivo completo
- Material técnico de entrenamiento
- Posibilidad de contrato profesional
- Participación en Liga Femenina 2`,
      description: `## Convocatoria de Pruebas

Convocamos pruebas oficiales para completar la plantilla del equipo femenino senior para la temporada 2024/25. Buscamos jugadoras talentosas y comprometidas con experiencia en competición federada.

## Proceso de selección

Las pruebas se realizarán durante dos jornadas consecutivas donde evaluaremos:
- Fundamentos técnicos individuales
- Capacidad física y atlética
- Inteligencia táctica y lectura de juego
- Adaptación al trabajo en equipo

## Fechas y horarios

**Fecha:** A confirmar tras inscripción
**Duración:** 2 días intensivos
**Ubicación:** Pabellón Municipal de Valencia

**Requisitos para participar:**
- Edad entre 18 y 28 años
- Experiencia demostrable en liga autonómica o superior
- Altura mínima recomendada: 1.70m
- Certificado médico deportivo en vigor
- Seguro deportivo actualizado`,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      publishedAt: new Date(),
      tags: 'prueba,femenino,valencia,senior,lf2',
      verified: true,
      contactEmail: 'rrhh@fcbarcelona.es',
      authorId: orgUser.id
    }
  })

  const opportunity3 = await prisma.opportunity.upsert({
    where: { slug: 'beca-baloncesto-estados-unidos-universidad' },
    update: {},
    create: {
      title: 'Beca Baloncesto + Estudios Estados Unidos',
      slug: 'beca-baloncesto-estados-unidos-universidad',
      type: 'beca',
      status: 'pendiente', // Pending approval
      level: 'amateur',
      city: 'California',
      country: 'Estados Unidos',
      modality: 'presencial',
      benefits: `**Beca completa que incluye:**
- Matrícula universitaria cubierta al 100%
- Alojamiento en campus universitario
- Manutención y seguro médico
- Entrenamiento de alto nivel con equipo NCAA
- Apoyo académico personalizado`,
      description: `## Programa de Becas Internacionales

Oportunidad única para jugadores catalanes con alto potencial de combinar estudios universitarios de calidad con baloncesto de élite en universidades americanas.

## Sobre el programa

Este programa está diseñado para jóvenes talentos que buscan desarrollar su carrera académica y deportiva simultáneamente. Trabajamos con más de 20 universidades americanas que ofrecen programas de becas completas.

## Proceso de selección

1. Evaluación técnica y física
2. Assessment académico y de inglés
3. Entrevistas personales
4. Matching con universidades
5. Tramitación de documentación

**Requisitos del programa:**
- Edad entre 16 y 18 años
- Expediente académico notable (mínimo 7/10)
- Nivel B2 de inglés certificado
- Altura mínima: 1.80m (masculino) / 1.70m (femenino)
- Experiencia en competición federada
- Disponibilidad para traslado a EEUU`,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      tags: 'beca,estados-unidos,universidad,ncaa,internacional',
      verified: false, // Not yet verified
      contactEmail: 'becas@basketusa.com',
      authorId: orgUser.id
    }
  })

  console.log('✅ Opportunities created')

  // Create sample application
  const application = await prisma.application.upsert({
    where: { 
      userId_opportunityId: {
        userId: regularUser.id,
        opportunityId: opportunity1.id
      }
    },
    update: {},
    create: {
      userId: regularUser.id,
      opportunityId: opportunity1.id,
      state: 'enviada',
      message: 'Buenos días,\n\nMe dirijo a ustedes para expresar mi interés en la posición de Entrenador de Cantera Masculina U16. Con 5 años de experiencia entrenando equipos juveniles y mi titulación de Entrenador Superior, creo que puedo aportar mucho valor al desarrollo de los jóvenes talentos del club.\n\nAdjunto mi CV y estaré encantado de ampliar cualquier información en una entrevista personal.\n\nSaludos cordiales,\nMarc González'
    }
  })

  console.log('✅ Application created')

  // Create audit log entries - TODO: Add when model ready
  /*
  await prisma.auditLog.create({
    data: {
      actorId: orgUser.id,
      action: 'created',
      entity: 'opportunity',
      entityId: opportunity1.id,
      metadata: JSON.stringify({
        title: opportunity1.title,
        type: opportunity1.type
      })
    }
  })

  await prisma.auditLog.create({
    data: {
      actorId: regularUser.id,
      action: 'applied',
      entity: 'application',
      entityId: application.id,
      metadata: JSON.stringify({
        opportunityTitle: opportunity1.title,
        applicationState: application.state
      })
    }
  })
  */

  console.log('✅ Audit logs created')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: 3 (1 admin, 1 org, 1 user)`)
  console.log(`- Organizations: 1`)
  console.log(`- Opportunities: 3 (2 published, 1 pending)`)
  console.log(`- Applications: 1`)
  console.log(`- Audit logs: 2`)
  
  console.log('\n🔐 Test accounts:')
  console.log(`Admin: admin@workhoops.es`)
  console.log(`Organization: fcbarcelona@workhoops.es`) 
  console.log(`User: jugador@workhoops.es`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })