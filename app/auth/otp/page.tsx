'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'

function OtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('¡Código enviado! Revisa tu bandeja de entrada.')
        setStep('otp')
      } else {
        setError(data.message || 'Error al solicitar código')
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password: otp,
        isOtp: 'true',
        redirect: false,
      })

      if (result?.error) {
        setError('Código inválido o expirado. Solicita uno nuevo.')
        setOtp('')
      } else if (result?.ok) {
        router.push('/auth/set-password')
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'email' ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'
              }`}>
                {step === 'otp' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <div className={`w-12 h-1 ${step === 'otp' ? 'bg-orange-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'otp' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="w-12 h-1 bg-gray-200" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-500">
                3
              </div>
            </div>
          </div>

          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {step === 'email' ? (
              <Mail className="w-6 h-6 text-orange-600" />
            ) : (
              <KeyRound className="w-6 h-6 text-orange-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {step === 'email' ? 'Paso 1: Tu email' : 'Paso 2: Introduce el código'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'email' 
              ? 'Escribe tu email y te enviaremos un código de 6 dígitos para acceder.'
              : `Hemos enviado un código a ${email}. Introdúcelo a continuación.`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Info box */}
          {step === 'email' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Escribe tu email registrado</li>
                <li>Recibirás un código de 6 dígitos</li>
                <li>Introduce el código y crea tu nueva contraseña</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                Este proceso tarda menos de 1 minuto.
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && !error && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email de tu cuenta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  data-testid="otp-email-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
                data-testid="otp-request-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar código a mi email
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de 6 dígitos
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  pattern="\d{6}"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                  disabled={loading}
                  autoFocus
                  data-testid="otp-code-input"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  El código expira en 10 minutos
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading || otp.length !== 6}
                data-testid="otp-verify-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar y continuar
                  </>
                )}
              </Button>

              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => handleRequestOtp({ preventDefault: () => {} } as React.FormEvent)}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                  disabled={loading}
                >
                  ¿No recibiste el código? Reenviar
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                    setMessage('')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cambiar email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
            ¿Ya tienes contraseña?{' '}
            <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
              Iniciar sesión normal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    }>
      <OtpForm />
    </Suspense>
  )
}
