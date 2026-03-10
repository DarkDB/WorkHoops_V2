'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ContactButtonProps {
  profileId: string
  profileUserId: string
  profileName: string
  isLoggedIn: boolean
  userRole?: string
  isOwnProfile?: boolean  // Indicador directo
}

export default function ContactButton({ 
  profileId, 
  profileUserId,
  profileName,
  isLoggedIn,
  userRole,
  isOwnProfile
}: ContactButtonProps) {
  const router = useRouter()
  const [isContacting, setIsContacting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const isClubOrAgency = userRole === 'club' || userRole === 'agencia'
  const isPlayerOrCoach = userRole === 'jugador' || userRole === 'entrenador'

  // Determinar si se debe mostrar el botón según los casos de uso
  const shouldShowButton = () => {
    // Caso 1 & 2: Jugador/Entrenador viendo perfil de otro jugador/entrenador -> NO mostrar
    if (isPlayerOrCoach && !isOwnProfile) {
      return false
    }
    
    // Jugador/Entrenador en su propio perfil -> Mostrar aviso informativo
    if (isPlayerOrCoach && isOwnProfile) {
      return true
    }
    
    // Casos 3 & 4: Club/Agencia viendo jugador/entrenador -> Mostrar
    if (isClubOrAgency) {
      return true
    }
    
    // Usuario no logueado -> Mostrar
    if (!isLoggedIn) {
      return true
    }
    
    return false
  }

  // Determinar el texto y comportamiento del botón
  const getButtonConfig = () => {
    // Jugador/Entrenador en su propio perfil
    if (isPlayerOrCoach && isOwnProfile) {
      return {
        text: 'Este es tu perfil',
        icon: <Mail className="w-4 h-4 mr-2" />,
        variant: 'outline' as const
      }
    }
    
    // Club/Agencia en perfil de jugador/entrenador
    if (isClubOrAgency) {
      return {
        text: 'Contactar',
        icon: <Mail className="w-4 h-4 mr-2" />,
        variant: 'default' as const
      }
    }
    
    // Default (no logueado)
    return {
      text: 'Contactar',
      icon: <Mail className="w-4 h-4 mr-2" />,
      variant: 'default' as const
    }
  }

  const handleOpenDialog = () => {
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

    // Jugador/Entrenador en su propio perfil
    if (isPlayerOrCoach && isOwnProfile) {
      toast.message('Este es tu perfil público', {
        description: 'Los clubs y agencias pueden contactarte desde aquí.'
      })
      return
    }

    if (isClubOrAgency) {
      setDialogOpen(true)
      return
    }
  }

  const handleContact = async () => {
    // Validate inputs
    if (!contactData.name.trim() || !contactData.email.trim() || !contactData.message.trim()) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactData.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido'
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
          profileUserId,
          contactName: contactData.name,
          contactEmail: contactData.email,
          contactMessage: contactData.message
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar solicitud')
      }

      toast.success('¡Solicitud enviada!', {
        description: 'El talento recibirá tu solicitud de contacto por email'
      })

      // Close dialog and reset form
      setDialogOpen(false)
      setContactData({ name: '', email: '', message: '' })
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al contactar'
      })
    } finally {
      setIsContacting(false)
    }
  }

  const buttonConfig = getButtonConfig()
  
  // No mostrar el botón en ciertos casos
  if (!shouldShowButton()) {
    return null
  }

  return (
    <>
      <Button 
        variant={buttonConfig.variant}
        className="w-full"
        onClick={handleOpenDialog}
        disabled={isPlayerOrCoach && !!isOwnProfile}
      >
        {buttonConfig.icon}
        {buttonConfig.text}
      </Button>

      {/* Contact Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar con {profileName}</DialogTitle>
            <DialogDescription>
              Ingresa tus datos de contacto. El talento recibirá un email con tu solicitud.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                placeholder="Ej: Juan Pérez"
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                disabled={isContacting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Tu correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                disabled={isContacting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <textarea
                id="message"
                placeholder="Escribe un mensaje para el talento..."
                value={contactData.message}
                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                disabled={isContacting}
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-workhoops-accent"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isContacting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContact}
              disabled={isContacting}
            >
              {isContacting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar solicitud
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
