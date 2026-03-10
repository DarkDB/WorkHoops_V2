'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

type PipelineStatus = 'SAVED' | 'CONTACTED' | 'INVITED' | 'SIGNED' | 'REJECTED'
type InviteType = 'INVITE_TO_APPLY' | 'INVITE_TO_TRYOUT'

interface ClubRecruitmentActionsProps {
  profileId: string
  profileName: string
  initialShortlisted?: boolean
  initialPipelineStatus?: PipelineStatus | null
  compact?: boolean
  onStateChange?: (next: { shortlisted: boolean; pipelineStatus: PipelineStatus | null }) => void
}

const statusLabels: Record<PipelineStatus, string> = {
  SAVED: 'Guardado',
  CONTACTED: 'Contactado',
  INVITED: 'Invitado',
  SIGNED: 'Fichado',
  REJECTED: 'Descartado'
}

export default function ClubRecruitmentActions({
  profileId,
  profileName,
  initialShortlisted = false,
  initialPipelineStatus = null,
  compact = false,
  onStateChange
}: ClubRecruitmentActionsProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted)
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(initialPipelineStatus)
  const [isSaving, setIsSaving] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteType, setInviteType] = useState<InviteType>('INVITE_TO_APPLY')
  const [inviteMessage, setInviteMessage] = useState('')

  const emitState = (next: { shortlisted: boolean; pipelineStatus: PipelineStatus | null }) => {
    onStateChange?.(next)
  }

  const handleToggleShortlist = async () => {
    setIsSaving(true)
    try {
      if (!shortlisted) {
        const response = await fetch('/api/talent/shortlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, status: 'SAVED' })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Error guardando jugador')

        setShortlisted(true)
        setPipelineStatus('SAVED')
        emitState({ shortlisted: true, pipelineStatus: 'SAVED' })
        toast.success('Jugador añadido a shortlist')
      } else {
        const response = await fetch('/api/talent/shortlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Error quitando jugador')

        setShortlisted(false)
        setPipelineStatus(null)
        emitState({ shortlisted: false, pipelineStatus: null })
        toast.success('Jugador eliminado de shortlist')
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo actualizar shortlist'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInvite = async () => {
    setIsInviting(true)
    try {
      const response = await fetch('/api/talent/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          type: inviteType,
          message: inviteMessage.trim() || undefined
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar la invitación')

      setShortlisted(true)
      setPipelineStatus('INVITED')
      emitState({ shortlisted: true, pipelineStatus: 'INVITED' })
      setInviteDialogOpen(false)
      setInviteMessage('')
      toast.success('Invitación enviada')
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo enviar la invitación'
      })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className={`space-y-2 ${compact ? '' : 'mt-3'}`}>
      <div className="flex items-center gap-2">
        <Button
          size={compact ? 'sm' : 'default'}
          variant={shortlisted ? 'outline' : 'default'}
          className={compact ? 'h-8' : ''}
          onClick={handleToggleShortlist}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 mr-2 ${shortlisted ? 'fill-current' : ''}`} />
          )}
          {shortlisted ? 'Quitar' : 'Guardar'}
        </Button>
        <Button
          size={compact ? 'sm' : 'default'}
          variant="outline"
          className={compact ? 'h-8' : ''}
          onClick={() => setInviteDialogOpen(true)}
        >
          <Send className="w-4 h-4 mr-2" />
          Invitar
        </Button>
      </div>

      {pipelineStatus && (
        <Badge variant="secondary" className="text-xs">
          Pipeline: {statusLabels[pipelineStatus]}
        </Badge>
      )}

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar a {profileName}</DialogTitle>
            <DialogDescription>
              Crea una invitación rápida para iniciar el proceso de scouting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de invitación</p>
              <Select value={inviteType} onValueChange={(value: InviteType) => setInviteType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVITE_TO_APPLY">Invitar a aplicar</SelectItem>
                  <SelectItem value="INVITE_TO_TRYOUT">Invitar a tryout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Mensaje (opcional)</p>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Ej: Nos interesa tu perfil para la próxima temporada..."
                maxLength={500}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)} disabled={isInviting}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar invitación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
