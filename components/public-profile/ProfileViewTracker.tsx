'use client'

import { useEffect } from 'react'

interface ProfileViewTrackerProps {
  profileUserId: string
  profileType: string
}

export function ProfileViewTracker({ profileUserId, profileType }: ProfileViewTrackerProps) {
  useEffect(() => {
    fetch('/api/profile/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUserId, profileType })
    }).catch(() => {}) // silencioso, no bloquea la página
  }, [profileUserId, profileType])

  return null
}
