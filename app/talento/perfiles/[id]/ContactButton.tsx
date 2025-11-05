'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Mail, Lock, Loader2, Zap, CheckCircle, Star } from 'lucide-react'
import { toast } from 'sonner'

interface ContactButtonProps {
  profileId: string
  profileUserId: string
  profileName: string
  canContact: boolean
  isLoggedIn: boolean
  userRole?: string
  currentUserId?: string  // Para saber si es el propio perfil
  isOwnProfile?: boolean  // Indicador directo
  userPlanType?: string   // Plan del usuario actual
}

export default function ContactButton({ 
  profileId, 
  profileUserId,
  profileName,
  canContact, 
  isLoggedIn,
  userRole,
  currentUserId,
  isOwnProfile,
  userPlanType
}: ContactButtonProps) {
  const router = useRouter()
  const [isContacting, setIsContacting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [interestDialogOpen, setInterestDialogOpen] = useState(false)
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  // Check if current user is club/agency or player/coach
  const isClubOrAgency = userRole === 'club' || userRole === 'agencia'
  const isPlayerOrCoach = userRole === 'jugador' || userRole === 'entrenador'

  // Determinar si se debe mostrar el botón según los casos de uso
  const shouldShowButton = () => {
    // Caso 1 & 2: Jugador/Entrenador viendo perfil de otro jugador/entrenador -> NO mostrar
    if (isPlayerOrCoach && !isOwnProfile) {
      return false
    }
    
    // Caso 1: Jugador/Entrenador en su propio perfil -> Mostrar (para informar sobre plan)
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
    // Caso 1: Jugador/Entrenador en su propio perfil SIN plan pro
    if (isPlayerOrCoach && isOwnProfile && !canContact) {
      return {
        text: 'Activar Plan Pro',
        icon: <Zap className="w-4 h-4 mr-2" />,
        variant: 'default' as const
      }
    }
    
    // Jugador/Entrenador en su propio perfil CON plan pro
    if (isPlayerOrCoach && isOwnProfile && canContact) {
      return {
        text: 'Plan Pro Activo',
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        variant: 'outline' as const
      }
    }
    
    // Caso 3: Club/Agencia en perfil de jugador/entrenador SIN plan pro
    if (isClubOrAgency && !canContact) {
      return {
        text: 'Notificar interés',
        icon: <Star className="w-4 h-4 mr-2" />,
        variant: 'outline' as const
      }
    }
    
    // Caso 4: Club/Agencia en perfil de jugador/entrenador CON plan pro
    if (isClubOrAgency && canContact) {
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

    // Caso 1: Jugador/Entrenador en su propio perfil SIN plan pro
    if (isPlayerOrCoach && isOwnProfile && !canContact) {
      setUpgradeDialogOpen(true)
      return
    }
    
    // Jugador/Entrenador en su propio perfil CON plan pro
    if (isPlayerOrCoach && isOwnProfile && canContact) {
      toast.success('Plan Pro Activo', {
        description: 'Los clubs y agencias pueden contactarte directamente'
      })
      return
    }

    // Caso 3: Club/Agencia viendo perfil SIN plan pro -> Notificar interés
    if (isClubOrAgency && !canContact) {
      setInterestDialogOpen(true)
      return
    }

    // Caso 4: Club/Agencia viendo perfil CON plan pro -> Contactar
    if (isClubOrAgency && canContact) {
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

  const handleNotifyInterest = async () => {
    setIsContacting(true)
    
    try {
      const response = await fetch('/api/talent/notify-interest', {
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
        throw new Error(data.message || 'Error al enviar notificación')
      }

      toast.success('¡Interés registrado!', {
        description: 'Notificaremos a este usuario que hay interés en su perfil'
      })

      setInterestDialogOpen(false)
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al notificar'
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
      >
        {buttonConfig.icon}
        {buttonConfig.text}
      </Button>

      {/* Contact Dialog - When user has Pro plan */}
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

      {/* Upgrade Dialog - For players/coaches */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-workhoops-accent" />
              <span>Activa Plan Pro para ser contactado</span>
            </DialogTitle>
            <DialogDescription>
              Con el Plan Pro, clubs y agencias pueden contactarte directamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Beneficios del Plan Pro:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Recibe solicitudes de contacto directo de clubs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Perfil destacado en búsquedas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Acceso a todas las ofertas premium</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Estadísticas avanzadas de perfil</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">4.99€<span className="text-sm font-normal text-gray-600">/mes</span></p>
              <p className="text-xs text-gray-600 mt-1">Cancela cuando quieras</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Ahora no
            </Button>
            <Link href="/planes" className="w-full sm:w-auto">
              <Button className="w-full bg-workhoops-accent hover:bg-orange-600">
                <Zap className="w-4 h-4 mr-2" />
                Activar Plan Pro
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interest Dialog - When user doesn't have Pro plan */}
      <Dialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-workhoops-accent" />
              <span>Plan Pro requerido</span>
            </DialogTitle>
            <DialogDescription>
              {isClubOrAgency 
                ? 'Este talento aún no tiene Plan Pro activo. Puedes notificarle tu interés.'
                : 'Activa el Plan Pro para recibir solicitudes de contacto directo de clubs y agencias.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Beneficios del Plan Pro:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Recibe solicitudes de contacto directo</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Perfil destacado en búsquedas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Acceso a todas las ofertas premium</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Estadísticas avanzadas de perfil</span>
                </li>
              </ul>
            </div>

            {isClubOrAgency ? (
              <p className="text-sm text-gray-600">
                Puedes notificar a <strong>{profileName}</strong> que hay interés en su perfil 
                y sugerirle activar el Plan Pro para que puedan contactarse.
              </p>
            ) : (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Solo 4.99€/mes</strong> para desbloquear todas las funciones Pro
                </p>
                <p className="text-xs text-gray-600">
                  Cancela cuando quieras. Sin compromisos.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setInterestDialogOpen(false)}
              disabled={isContacting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            
            {isClubOrAgency ? (
              <Button
                variant="outline"
                onClick={handleNotifyInterest}
                disabled={isContacting}
                className="w-full sm:w-auto"
              >
                {isContacting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Notificando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Notificar interés
                  </>
                )}
              </Button>
            ) : (
              <Link href="/planes" className="w-full sm:w-auto">
                <Button className="w-full bg-workhoops-accent hover:bg-orange-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Activar Plan Pro
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
