import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import AdminUsersManager from '@/components/AdminUsersManager'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is admin
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all users with their stats
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          opportunities: true,
          applications: true
        }
      },
      talentProfile: {
        select: {
          id: true,
          playerRole: true
        }
      },
      clubAgencyProfile: {
        select: {
          id: true,
          clubType: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminUsersManager users={JSON.parse(JSON.stringify(users))} />
    </div>
  )
}
