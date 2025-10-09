'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('workhoops-cookie-consent')
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('workhoops-cookie-consent', 'all')
    setIsVisible(false)
  }

  const rejectAll = () => {
    localStorage.setItem('workhoops-cookie-consent', 'necessary')
    setIsVisible(false)
  }

  const savePreferences = () => {
    localStorage.setItem('workhoops-cookie-consent', 'custom')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2">
        <div className="p-6">
          {!showSettings ? (
            /* Basic Banner */
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start space-x-3 flex-1">
                <Cookie className="w-6 h-6 text-workhoops-accent flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🍪 Respetamos tu privacidad
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                    para mejorar tu experiencia. Puedes elegir qué tipos de cookies aceptar.
                  </p>
                  <div className="mt-2">
                    <Link href="/legal/cookies" className="text-workhoops-accent text-sm hover:underline">
                      Más información sobre cookies
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={rejectAll}
                  className="w-full sm:w-auto"
                >
                  Solo necesarias
                </Button>
                <Button 
                  size="sm" 
                  onClick={acceptAll}
                  className="w-full sm:w-auto bg-workhoops-accent hover:bg-orange-600"
                >
                  Aceptar todas
                </Button>
              </div>
            </div>
          ) : (
            /* Settings Panel */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configuración de cookies
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cookies necesarias</h4>
                    <p className="text-sm text-gray-600">
                      Esenciales para el funcionamiento del sitio web. No se pueden desactivar.
                    </p>
                  </div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Siempre activas
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cookies analíticas</h4>
                    <p className="text-sm text-gray-600">
                      Nos ayudan a entender cómo utilizas el sitio web para mejorarlo.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-workhoops-accent focus:ring-workhoops-accent"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cookies de funcionalidad</h4>
                    <p className="text-sm text-gray-600">
                      Permiten recordar tus preferencias para una mejor experiencia.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-workhoops-accent focus:ring-workhoops-accent"
                    defaultChecked
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={rejectAll}
                  className="flex-1"
                >
                  Rechazar opcionales
                </Button>
                <Button 
                  onClick={savePreferences}
                  className="flex-1 bg-workhoops-accent hover:bg-orange-600"
                >
                  Guardar preferencias
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Puedes cambiar estas preferencias en cualquier momento en{' '}
                <Link href="/legal/cookies" className="text-workhoops-accent hover:underline">
                  nuestra política de cookies
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}