import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import PlayerProfileOnboarding from '@/components/PlayerProfileOnboarding'
import CoachProfileOnboarding from '@/components/CoachProfileOnboarding'
import ClubAgencyProfileOnboarding from '@/components/ClubAgencyProfileOnboarding'

export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/login')
  }

  const userRole = session.user.role

  // Verificar si es jugador o entrenador
  if (userRole === 'jugador' || userRole === 'entrenador') {
    // Obtener perfil existente si lo hay
    let profile = null
    
    if (userRole === 'jugador') {
      profile = await prisma.talentProfile.findUnique({
        where: { userId: session.user.id },
        include: { playerSkills: true }
      })
    } else if (userRole === 'entrenador') {
      profile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
      })
    }

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
    const serializedProfile = profile ? {
      ...profile,
      birthDate: profile.birthDate?.toISOString() || null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      ...(userRole === 'jugador' && profile.playerSkills ? {
        playerSkills: {
          ...profile.playerSkills,
          createdAt: profile.playerSkills.createdAt.toISOString(),
          updatedAt: profile.playerSkills.updatedAt.toISOString()
        }
      } : {})
    } : null

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {userRole === 'jugador' ? (
          <PlayerProfileOnboarding 
            user={user!}
            existingProfile={serializedProfile}
          />
        ) : (
          <CoachProfileOnboarding 
            user={user!}
            existingProfile={serializedProfile}
          />
        )}
      </div>
    )
  }

  // Verificar si es club o agencia
  if (userRole === 'club' || userRole === 'agencia') {
    // Obtener perfil existente si lo hay
    const profile = await prisma.clubAgencyProfile.findUnique({
      where: { userId: session.user.id }
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
    const serializedProfile = profile ? {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    } : null

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <ClubAgencyProfileOnboarding 
          user={user!}
          existingProfile={serializedProfile}
        />
      </div>
    )
  }

  // Si no es ningún rol válido, redirigir al dashboard
  redirect('/dashboard')
}
