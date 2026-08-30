'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegistrationGateProps {
  slug?: string
}

export function RegistrationGate({ slug }: RegistrationGateProps) {
  const router = useRouter()
  const redirectPath = slug ? `/oportunidades/${slug}` : '/oportunidades'
  const registerUrl = `/auth/register?redirect=${encodeURIComponent(redirectPath)}`

  return (
    <Card className="bg-gradient-to-br from-workhoops-accent to-orange-600 border-0 text-white">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-3">
          <span className="text-3xl">⚡</span>
        </div>

        <h3 className="text-2xl font-bold mb-2">
          Regístrate gratis para ver esta oferta completa
        </h3>

        <p className="text-orange-100 mb-6">
          Consulta condiciones completas, club y forma de aplicar.
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Consulta todos los requisitos y condiciones</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Conoce el club antes de aplicar</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm">Aplica desde WorkHoops con tu perfil</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-white text-workhoops-accent hover:bg-gray-100 font-semibold text-lg py-6"
            onClick={() => router.push(registerUrl)}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Crear cuenta gratis y ver condiciones
          </Button>

          <button
            className="text-white/80 hover:text-white text-sm underline"
            onClick={() => router.push('/auth/login')}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>

        <p className="text-xs text-orange-100 mt-4">Registro gratuito</p>
      </CardContent>
    </Card>
  )
}
