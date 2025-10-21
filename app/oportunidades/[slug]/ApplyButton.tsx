'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Clock, CheckCircle } from 'lucide-react'

interface ApplyButtonProps {
  opportunityId: string
  hasApplied: boolean
  deadline: Date | null
  applicationUrl?: string | null
}

export default function ApplyButton({ 
  opportunityId, 
  hasApplied, 
  deadline,
  applicationUrl 
}: ApplyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isApplying, setIsApplying] = useState(false)
  const [applied, setApplied] = useState(hasApplied)

  const daysUntilDeadline = () => {
    if (!deadline) return 999 // No deadline means always open
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleApply = async () => {
    if (!session) {
      toast.error('Inicia sesión para aplicar')
      router.push('/auth/login')
      return
    }

    if (applicationUrl) {
      // External application - open in new tab
      window.open(applicationUrl, '_blank')
      return
    }

    // Internal application
    setIsApplying(true)
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          message: '' // Optional message field
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al aplicar')
      }

      setApplied(true)
      toast.success('¡Aplicación enviada!', {
        description: 'Tu aplicación ha sido enviada correctamente'
      })
    } catch (error) {
      toast.error('Error al aplicar', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo'
      })
    } finally {
      setIsApplying(false)
    }
  }

  const isDeadlinePassed = deadline && daysUntilDeadline() <= 0

  if (applied) {
    return (
      <Button className="w-full" size="lg" disabled>
        <CheckCircle className="w-4 h-4 mr-2" />
        Ya aplicaste
      </Button>
    )
  }

  if (isDeadlinePassed) {
    return (
      <Button className="w-full" size="lg" disabled>
        <Clock className="w-4 h-4 mr-2" />
        Plazo cerrado
      </Button>
    )
  }

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleApply}
      disabled={isApplying}
    >
      {isApplying ? 'Aplicando...' : applicationUrl ? 'Aplicar en web externa' : 'Aplicar ahora'}
    </Button>
  )
}