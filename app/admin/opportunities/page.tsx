import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import AdminOpportunitiesManager from '@/components/AdminOpportunitiesManager'

export default async function AdminOpportunitiesPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is admin
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all opportunities with author info
  const opportunities = await prisma.opportunity.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      organization: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      },
      _count: {
        select: {
          applications: true
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
      <AdminOpportunitiesManager opportunities={JSON.parse(JSON.stringify(opportunities))} />
    </div>
  )
}
