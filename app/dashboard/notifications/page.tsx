import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import EmailPreferencesManager from '@/components/dashboard/EmailPreferencesManager'

export default async function DashboardNotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Mail className="w-7 h-7 mr-3 text-workhoops-accent" />
          Preferencias de email
        </h1>
        <p className="text-gray-600 mt-2 mb-8">
          Controla qué emails quieres recibir y con qué frecuencia.
        </p>

        <EmailPreferencesManager />
      </div>
    </div>
  )
}
