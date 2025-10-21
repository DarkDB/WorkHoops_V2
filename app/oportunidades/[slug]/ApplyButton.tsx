'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Clock, CheckCircle } from 'lucide-react'

interface ApplyButtonProps {
  opportunityId: string
  hasApplied: boolean
  deadline: string
  applicationUrl?: string | null
}

export default function ApplyButton({ 
  opportunityId, 
  hasApplied, 
  deadline,
  applicationUrl 
}: ApplyButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isApplying, setIsApplying] = useState(false)
  const [applied, setApplied] = useState(hasApplied)

  const daysUntilDeadline = () => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleApply = async () => {
    if (!session) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para aplicar a esta oportunidad",
        variant: "destructive"
      })
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

      if (!response.ok) {
        throw new Error('Error al aplicar')
      }

      setApplied(true)
      toast({
        title: "¡Aplicación enviada!",
        description: "Tu aplicación ha sido enviada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la aplicación. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const isDeadlinePassed = daysUntilDeadline() <= 0

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