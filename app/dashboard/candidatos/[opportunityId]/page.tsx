import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import CandidatesManager from '@/components/CandidatesManager'

export default async function CandidatesPage({ params }: { params: { opportunityId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/login')
  }

  // Verificar que el usuario sea club o agencia
  if (session.user.role !== 'club' && session.user.role !== 'agencia' && session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Obtener la oportunidad con sus candidatos
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.opportunityId },
    include: {
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              createdAt: true
            }
          },
          talentProfile: {
            select: {
              id: true,
              role: true,
              experience: true,
              bio: true,
              height: true,
              weight: true,
              preferredPosition: true,
              achievements: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  if (!opportunity) {
    redirect('/dashboard')
  }

  // Verificar que el usuario sea el autor de la oportunidad o admin
  if (opportunity.author.id !== session.user.id && session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CandidatesManager 
        opportunity={JSON.parse(JSON.stringify(opportunity))}
      />
    </div>
  )
}
