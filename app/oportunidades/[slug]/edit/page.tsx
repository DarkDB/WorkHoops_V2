import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import EditOpportunityForm from '@/components/EditOpportunityForm'

interface EditOpportunityPageProps {
  params: {
    slug: string
  }
}

export default async function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'club' && session.user.role !== 'agencia') {
    redirect('/dashboard')
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: params.slug }
  })

  if (!opportunity) {
    redirect('/dashboard')
  }

  if (opportunity.authorId !== session.user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <EditOpportunityForm opportunity={opportunity} />
    </div>
  )
}
