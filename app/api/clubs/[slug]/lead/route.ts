import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { sendClubLeadReceivedEmail } from '@/lib/email'
import { trackFunnelEvent } from '@/lib/funnel-events'

const createClubLeadSchema = z.object({
  fullName: z.string().min(2, 'El nombre es requerido'),
  age: z.number().int().min(12).max(60).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  height: z.number().int().min(120).max(250).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  email: z.string().email('Email inválido'),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().min(8, 'Añade un mensaje corto').max(1500)
})

function calculateAge(birthDate?: Date | null) {
  if (!birthDate) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age
}

export async function POST(request: NextRequest, context: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const club = await prisma.clubAgencyProfile.findUnique({
      where: { slug: context.params.slug },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!club || (club.user.role !== 'club' && club.user.role !== 'agencia')) {
      return NextResponse.json({ message: 'Club no encontrado' }, { status: 404 })
    }

    let payload = {
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      age: typeof body.age === 'number' ? body.age : body.age ? Number(body.age) : null,
      position: body.position || null,
      height: typeof body.height === 'number' ? body.height : body.height ? Number(body.height) : null,
      city: body.city || null,
      email: typeof body.email === 'string' ? body.email : '',
      phone: body.phone || null,
      message: typeof body.message === 'string' ? body.message : ''
    }

    if (session?.user?.id) {
      const sourceUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          talentProfile: {
            select: {
              fullName: true,
              birthDate: true,
              position: true,
              height: true,
              city: true
            }
          }
        }
      })

      if (sourceUser?.talentProfile) {
        payload = {
          ...payload,
          fullName: payload.fullName || sourceUser.talentProfile.fullName,
          age: payload.age || calculateAge(sourceUser.talentProfile.birthDate),
          position: payload.position || sourceUser.talentProfile.position || null,
          height: payload.height || sourceUser.talentProfile.height || null,
          city: payload.city || sourceUser.talentProfile.city || null,
          email: payload.email || sourceUser.email
        }
      }
    }

    const validatedData = createClubLeadSchema.parse(payload)

    const lead = await prisma.clubLead.create({
      data: {
        clubUserId: club.userId,
        clubProfileId: club.id,
        fullName: validatedData.fullName,
        age: validatedData.age ?? null,
        position: validatedData.position ?? null,
        height: validatedData.height ?? null,
        city: validatedData.city ?? null,
        email: validatedData.email,
        phone: validatedData.phone ?? null,
        message: validatedData.message,
        status: 'NEW',
        sourceUserId: session?.user?.id || null
      }
    })

    await createNotification({
      userId: club.userId,
      type: 'club_lead_received',
      title: 'Nuevo jugador interesado',
      message: `${validatedData.fullName} quiere jugar en ${club.commercialName || club.legalName}`,
      link: '/dashboard/leads'
    })

    try {
      await sendClubLeadReceivedEmail({
        clubEmail: club.contactEmail || club.user.email,
        clubName: club.commercialName || club.legalName,
        playerName: validatedData.fullName,
        playerEmail: validatedData.email,
        playerPhone: validatedData.phone || null,
        message: validatedData.message,
        leadsUrl: `${process.env.APP_URL}/dashboard/leads`
      })
    } catch (emailError) {
      console.error('Lead email send failed:', emailError)
    }

    await trackFunnelEvent({
      eventName: 'application_sent',
      userId: session?.user?.id || null,
      role: session?.user?.role || 'anonymous',
      metadata: {
        channel: 'club_public_page',
        clubSlug: context.params.slug,
        leadId: lead.id
      }
    })

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Solicitud enviada correctamente al club'
    }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.errors }, { status: 400 })
    }

    console.error('Error creating club lead:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
