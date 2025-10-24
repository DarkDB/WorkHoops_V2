'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  opportunityTitle: string
  opportunityUrl: string
}

export default function ShareButton({ opportunityTitle, opportunityUrl }: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(opportunityUrl)
      setCopied(true)
      toast.success('¡Enlace copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const handleShare = async () => {
    // Use native share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunityTitle,
          text: `Mira esta oportunidad en WorkHoops: ${opportunityTitle}`,
          url: opportunityUrl
        })
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          setDialogOpen(true)
        }
      }
    } else {
      setDialogOpen(true)
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir oportunidad</DialogTitle>
            <DialogDescription>
              Comparte esta oportunidad con otros
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={opportunityUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(opportunityTitle)}&url=${encodeURIComponent(opportunityUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunityUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunityUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
