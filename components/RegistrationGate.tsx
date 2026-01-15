'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, UserPlus, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RegistrationGate() {
  const router = useRouter()

  return (
    <Card className="bg-gradient-to-br from-workhoops-accent to-orange-600 border-0 text-white">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-2">
          🔒 Información de Contacto Bloqueada
        </h3>
        
        <p className="text-orange-100 mb-6 text-lg">
          Regístrate gratis para ver los datos de contacto y aplicar a esta oportunidad
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Acceso instantáneo al email y teléfono de contacto</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Aplica con 1 click a cientos de oportunidades</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Guarda tus favoritos y recibe alertas</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full bg-white text-workhoops-accent hover:bg-gray-100 font-semibold text-lg py-6"
            onClick={() => router.push('/auth/register')}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Crear Cuenta Gratis
          </Button>
          
          <button 
            className="text-white/80 hover:text-white text-sm underline"
            onClick={() => router.push('/auth/login')}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>

        <p className="text-xs text-orange-100 mt-4">
          ⚡ Registro en menos de 30 segundos • 100% Gratis
        </p>
      </CardContent>
    </Card>
  )
}
