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
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).catch((error) => {
    console.error('Error fetching users:', error)
    return [] // Return empty array if error
  })

  // Try to fetch profiles separately to handle missing tables
  let usersWithProfiles = users
  try {
    const talentProfiles = await prisma.talentProfile.findMany({
      where: {
        userId: { in: users.map(u => u.id) }
      },
      select: {
        id: true,
        role: true,
        userId: true
      }
    })

    const clubProfiles = await prisma.clubAgencyProfile.findMany({
      where: {
        userId: { in: users.map(u => u.id) }
      },
      select: {
        id: true,
        entityType: true,
        userId: true
      }
    }).catch(() => []) // If table doesn't exist, return empty array

    // Merge profiles with users
    usersWithProfiles = users.map(user => ({
      ...user,
      talentProfile: talentProfiles.find(p => p.userId === user.id) || null,
      clubAgencyProfile: clubProfiles.find(p => p.userId === user.id) || null
    }))
  } catch (error) {
    console.error('Error fetching profiles:', error)
    // If profiles fetch fails, just use users without profiles
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminUsersManager users={JSON.parse(JSON.stringify(usersWithProfiles))} />
    </div>
  )
}
