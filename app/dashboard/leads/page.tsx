import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'
import ClubLeadsManager from '@/components/dashboard/ClubLeadsManager'

export default async function DashboardClubLeadsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'club' && session.user.role !== 'agencia' && session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const leads = await prisma.clubLead.findMany({
    where: {
      clubUserId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      position: true,
      height: true,
      city: true,
      email: true,
      phone: true,
      message: true,
      status: true,
      createdAt: true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="w-7 h-7 mr-3 text-workhoops-accent" />
          Jugadores interesados
        </h1>
        <p className="text-gray-600 mt-1 mb-8">
          Gestiona los leads que llegan desde tu página pública de club.
        </p>

        <ClubLeadsManager
          initialLeads={leads.map((lead) => ({
            ...lead,
            createdAt: lead.createdAt.toISOString()
          }))}
        />
      </div>
    </div>
  )
}
