'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  opportunityId: string
  isFavorited: boolean
  isLoggedIn: boolean
}

export default function FavoriteButton({ opportunityId, isFavorited, isLoggedIn }: FavoriteButtonProps) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(isFavorited)
  const [loading, setLoading] = useState(false)

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error('Inicia sesión', {
        description: 'Necesitas una cuenta para guardar favoritos',
        action: {
          label: 'Registrarse',
          onClick: () => router.push('/auth/register')
        }
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/favorites', {
        method: favorited ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ opportunityId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar favorito')
      }

      setFavorited(!favorited)
      toast.success(favorited ? 'Eliminado de favoritos' : 'Añadido a favoritos')
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Error al actualizar favorito'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={favorited ? 'text-red-500 border-red-500' : ''}
    >
      <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
    </Button>
  )
}
