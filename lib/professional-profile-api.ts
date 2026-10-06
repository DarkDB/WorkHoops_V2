import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { createProfessionalProfileService, ProfessionalActor, ProfessionalProfileError } from './professional-profile-service'

export const professionalProfiles = createProfessionalProfileService(prisma)
export async function professionalRequest(action: (actor: ProfessionalActor) => Promise<unknown>, successStatus = 200) {
  const json = (body: unknown, status: number) => NextResponse.json(body, {
    status, headers: { 'Cache-Control': 'private, no-store' }
  })
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return json({ error: 'No autenticado' }, 401)
    // Evidence authorization must not trust an old admin role cached in a JWT.
    const actor = await prisma.user.findUnique({
      where: { id: session.user.id }, select: { id: true, role: true, isActive: true }
    })
    if (!actor?.isActive) return json({ error: 'No autorizado' }, 403)
    return json(await action({ id: actor.id, role: actor.role }), successStatus)
  } catch (error) {
    if (error instanceof ProfessionalProfileError) return json({ error: error.message }, error.status)
    if (error instanceof z.ZodError) return json({ error: 'Datos inválidos', details: error.issues }, 400)
    if (error instanceof SyntaxError) return json({ error: 'JSON inválido' }, 400)
    // Do not return Prisma errors or personal data in the response or logs.
    console.error('[professional-profile] Request failed')
    return json({ error: 'Error interno del servidor' }, 500)
  }
}
