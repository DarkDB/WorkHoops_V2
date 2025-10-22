'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface ContactButtonProps {
  profileId: string
  profileUserId: string
  canContact: boolean
  isLoggedIn: boolean
}

export default function ContactButton({ 
  profileId, 
  profileUserId, 
  canContact, 
  isLoggedIn 
}: ContactButtonProps) {
  const router = useRouter()
  const [isContacting, setIsContacting] = useState(false)

  const handleContact = async () => {
    // Not logged in
    if (!isLoggedIn) {
      toast.error('Regístrate para contactar', {
        description: 'Necesitas una cuenta para contactar con talentos',
        action: {
          label: 'Registrarse',
          onClick: () => router.push('/auth/register')
        }
      })
      return
    }

    // User doesn't have pro plan
    if (!canContact) {
      toast.error('Usuario necesita actualizar plan', {
        description: 'Este talento debe tener plan Pro Semipro para recibir contactos'
      })
      return
    }

    // Contact logic
    setIsContacting(true)
    
    try {
      const response = await fetch('/api/talent/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId,
          profileUserId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar solicitud')
      }

      toast.success('¡Solicitud enviada!', {
        description: 'El talento recibirá tu solicitud de contacto'
      })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al contactar'
      })
    } finally {
      setIsContacting(false)
    }
  }

  return (
    <Button 
      className="w-full"
      onClick={handleContact}
      disabled={isContacting}
    >
      {!canContact ? (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Plan requerido
        </>
      ) : (
        <>
          <Mail className="w-4 h-4 mr-2" />
          {isContacting ? 'Enviando...' : 'Contactar'}
        </>
      )}
    </Button>
  )
}
