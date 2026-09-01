import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'jugador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const profile = await prisma.talentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, availabilityStatus: true }
  })

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  if (profile.availabilityStatus === 'NOT_AVAILABLE') {
    return NextResponse.json(
      { error: 'Actualiza primero tu disponibilidad para confirmarla.' },
      { status: 400 }
    )
  }

  const availabilityConfirmedAt = new Date()
  await prisma.talentProfile.update({
    where: { id: profile.id },
    data: { availabilityConfirmedAt }
  })

  return NextResponse.json({ success: true, availabilityConfirmedAt })
}
