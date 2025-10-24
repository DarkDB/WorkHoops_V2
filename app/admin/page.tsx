import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is admin
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get admin stats
  const [totalUsers, totalOpportunities, pendingOpportunities, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { status: 'borrador' } }),
    prisma.application.count()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminDashboard 
        totalUsers={totalUsers}
        totalOpportunities={totalOpportunities}
        pendingOpportunities={pendingOpportunities}
        totalApplications={totalApplications}
      />
    </div>
  )
}
