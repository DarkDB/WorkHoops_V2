'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConfirmAvailabilityButtonProps {
  confirmedAt?: string | null
}

export default function ConfirmAvailabilityButton({ confirmedAt }: ConfirmAvailabilityButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastConfirmedAt, setLastConfirmedAt] = useState(confirmedAt)

  const confirmAvailability = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/talent/profile/confirm-availability', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo confirmar la disponibilidad')
      setLastConfirmedAt(data.availabilityConfirmedAt)
      toast.success('Disponibilidad confirmada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo confirmar la disponibilidad')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-900">Mantén tu disponibilidad al día</p>
          <p className="text-sm text-green-800">
            {lastConfirmedAt
              ? `Confirmada el ${new Date(lastConfirmedAt).toLocaleDateString('es-ES')}`
              : 'Confirma que sigues disponible para dar contexto actualizado a los clubes.'}
          </p>
        </div>
        <Button type="button" size="sm" onClick={confirmAvailability} disabled={isSubmitting}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Confirmando...' : 'Confirmar que sigo disponible'}
        </Button>
      </div>
    </div>
  )
}
