'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'

const roleCards = [
  {
    value: 'jugador',
    emoji: '🏀',
    label: 'Jugador',
    sublabel: 'Busco equipo',
  },
  {
    value: 'entrenador',
    emoji: '📋',
    label: 'Entrenador',
    sublabel: 'Busco proyecto',
  },
  {
    value: 'club',
    emoji: '🏟️',
    label: 'Club / Agencia',
    sublabel: 'Quiero fichar talento',
    fullWidth: true,
  },
]

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

function ProgressIndicator({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center space-y-1 mb-6">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-workhoops-accent' : 'bg-gray-300'}`} />
        <div className={`w-16 h-0.5 ${step === 2 ? 'bg-workhoops-accent' : 'bg-gray-200'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-workhoops-accent' : 'bg-gray-300'}`} />
      </div>
      <span className="text-xs text-gray-400">Paso {step} de 2</span>
    </div>
  )
}

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    planType: 'free_amateur',
  })
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams?.get('role') ?? searchParams?.get('rol') ?? ''

  useEffect(() => {
    if (roleFromUrl && ['jugador', 'entrenador', 'club', 'agencia'].includes(roleFromUrl)) {
      const normalizedRole = roleFromUrl === 'agencia' ? 'club' : roleFromUrl
      setFormData(prev => ({ ...prev, role: normalizedRole }))
    }
  }, [roleFromUrl])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setError('Por favor, introduce tu email')
      return
    }
    setError('')
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.role) {
      setError('Por favor, selecciona tu rol')
      setIsLoading(false)
      return
    }

    if (!formData.name) {
      setError('Por favor, introduce tu nombre')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          planType: 'free_amateur',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la cuenta')
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Cuenta creada, pero error al iniciar sesión. Intenta iniciar sesión manualmente.')
      } else {
        if (formData.role === 'club') {
          router.push('/profile/complete')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Error al conectar con Google')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Back link */}
          <div>
            <button
              onClick={step === 2 ? () => { setStep(1); setError('') } : undefined}
              className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors cursor-pointer"
            >
              {step === 2 ? (
                <>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Paso anterior
                </>
              ) : (
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver al inicio
                </Link>
              )}
            </button>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="pb-2 pt-6 px-6">
              <ProgressIndicator step={step} />

              {step === 1 ? (
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold text-workhoops-primary">Únete a WorkHoops</h1>
                  <p className="text-sm text-gray-500">El mercado de baloncesto más grande de España y LATAM</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold text-workhoops-primary">Cuéntanos sobre ti</h1>
                  <p className="text-sm text-gray-500">Para mostrarte las oportunidades más relevantes</p>
                </div>
              )}
            </CardHeader>

            <CardContent className="px-6 pb-4 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <>
                  {/* Google — CTA principal */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleRegister}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-5 text-base shadow-sm"
                  >
                    <GoogleIcon />
                    Continuar con Google
                  </Button>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-400">o continúa con email</span>
                    </div>
                  </div>

                  {/* Formulario solo email */}
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full py-5 text-base font-semibold" disabled={isLoading}>
                      Continuar →
                    </Button>
                  </form>

                  <p className="text-center text-xs text-gray-400">
                    Gratis para siempre · Sin tarjeta de crédito · 30 segundos
                  </p>
                </>
              )}

              {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name">¿Cómo te llaman en la pista?</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre o apodo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Contraseña con toggle */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Selección de rol como cards */}
                  <div className="space-y-2">
                    <Label>¿Cuál es tu rol?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {roleCards.filter(r => !r.fullWidth).map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleInputChange('role', role.value)}
                          className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all ${
                            formData.role === role.value
                              ? 'border-workhoops-accent bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className="text-2xl mb-1">{role.emoji}</span>
                          <span className="font-semibold text-sm text-workhoops-primary">{role.label}</span>
                          <span className="text-xs text-gray-500">{role.sublabel}</span>
                        </button>
                      ))}
                      {/* Club card full width */}
                      {roleCards.filter(r => r.fullWidth).map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleInputChange('role', role.value)}
                          className={`col-span-2 flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            formData.role === role.value
                              ? 'border-workhoops-accent bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className="text-2xl">{role.emoji}</span>
                          <div>
                            <span className="font-semibold text-sm text-workhoops-primary block">{role.label}</span>
                            <span className="text-xs text-gray-500">{role.sublabel}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-5 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear mi perfil gratis →
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 px-6 pb-6">
              <div className="text-sm text-center text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-workhoops-accent hover:underline font-medium">
                  Entra aquí →
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-gray-400">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/legal/terminos" className="hover:underline">Términos de Servicio</Link>
            {' '}y{' '}
            <Link href="/legal/privacidad" className="hover:underline">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
