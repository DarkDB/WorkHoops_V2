import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/shared/Navbar'
import AdminResourcesManager from '@/components/admin/AdminResourcesManager'

export default async function AdminResourcesPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is admin
  if (!session || !session.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminResourcesManager />
    </div>
  )
}
