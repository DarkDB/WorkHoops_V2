import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import PlayerProfileOnboarding from '@/components/PlayerProfileOnboarding'

export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Verificar si es jugador o entrenador
  if (session.user.role !== 'jugador' && session.user.role !== 'entrenador') {
    redirect('/dashboard')
  }

  // Obtener perfil existente si lo hay
  const talentProfile = await prisma.talentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      playerSkills: true
    }
  })

  // Obtener datos del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  // Serializar datos de manera segura
  const serializedProfile = talentProfile ? {
    ...talentProfile,
    birthDate: talentProfile.birthDate?.toISOString() || null,
    createdAt: talentProfile.createdAt.toISOString(),
    updatedAt: talentProfile.updatedAt.toISOString(),
    playerSkills: talentProfile.playerSkills ? {
      ...talentProfile.playerSkills,
      createdAt: talentProfile.playerSkills.createdAt.toISOString(),
      updatedAt: talentProfile.playerSkills.updatedAt.toISOString()
    } : null
  } : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PlayerProfileOnboarding 
        user={user!}
        existingProfile={serializedProfile}
      />
    </div>
  )
}
