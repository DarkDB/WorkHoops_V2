'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegistrationGateProps {
  slug?: string
}

export function RegistrationGate({ slug }: RegistrationGateProps) {
  const router = useRouter()
  const redirectPath = slug ? `/oportunidades/${slug}` : '/oportunidades'
  const registerUrl = `/auth/register?redirect=${encodeURIComponent(redirectPath)}`

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-workhoops-accent to-orange-600 text-white shadow-md">
      <CardContent className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <UserPlus className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-bold leading-tight">Regístrate gratis para ver la oportunidad completa</h2>
        <p className="mt-2 text-sm leading-6 text-orange-50">
          Crea tu perfil en WorkHoops y accede a las condiciones completas, el club y la candidatura.
        </p>

        <div className="mt-5 space-y-2 text-sm text-orange-50">
          <p className="flex gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />Consulta requisitos y condiciones.</p>
          <p className="flex gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />Presenta tu candidatura desde tu perfil.</p>
        </div>

        <Button
          size="lg"
          className="mt-6 w-full bg-white font-semibold text-workhoops-accent hover:bg-orange-50"
          onClick={() => router.push(registerUrl)}
        >
          Crear cuenta gratis
        </Button>
        <button className="mt-3 w-full text-sm text-orange-100 underline-offset-4 hover:text-white hover:underline" onClick={() => router.push('/auth/login')}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </CardContent>
    </Card>
  )
}
