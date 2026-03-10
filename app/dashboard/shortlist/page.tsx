import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bookmark } from 'lucide-react'
import ClubShortlistManager from '@/components/dashboard/ClubShortlistManager'

export default async function ClubShortlistPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'club' && session.user.role !== 'agencia' && session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const items = await prisma.talentShortlist.findMany({
    where: { clubUserId: session.user.id },
    include: {
      talentProfile: {
        select: {
          id: true,
          fullName: true,
          city: true,
          country: true,
          position: true,
          currentLevel: true,
          availabilityStatus: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bookmark className="w-7 h-7 mr-3 text-workhoops-accent" />
            Shortlist de scouting
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona talento guardado, seguimiento y decisiones de reclutamiento.
          </p>
        </div>

        <ClubShortlistManager
          initialItems={items.map((item) => ({
            ...item,
            updatedAt: item.updatedAt.toISOString()
          }))}
        />
      </div>
    </div>
  )
}
