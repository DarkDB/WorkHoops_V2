'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Mail, Lock, User, ArrowLeft, Github, Users, Trophy, Zap } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

const roles = [
  { 
    value: 'jugador', 
    label: 'Jugador', 
    icon: <User className="w-4 h-4" />,
    description: 'Busco oportunidades para jugar'
  },
  { 
    value: 'entrenador', 
    label: 'Entrenador', 
    icon: <Users className="w-4 h-4" />,
    description: 'Busco oportunidades para entrenar'
  },
  { 
    value: 'club', 
    label: 'Club/Agencia', 
    icon: <Trophy className="w-4 h-4" />,
    description: 'Busco jugadores y entrenadores'
  }
]

const plans = [
  {
    id: 'free_amateur',
    name: 'Free (Amateur)',
    price: 'Gratis',
    features: ['Perfil público', 'Ofertas básicas', 'Eventos gratuitos']
  },
  {
    id: 'pro_semipro',
    name: 'Pro (Semi-Pro)',
    price: '4.99€/mes',
    popular: true,
    features: ['Todas las ofertas', 'Perfil destacado', 'Aplicaciones ilimitadas', 'Soporte prioritario']
  }
]

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    planType: 'free_amateur'
  })
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams?.get('plan')

  // Set plan from URL parameter if exists
  useState(() => {
    if (planFromUrl && ['free_amateur', 'pro_semipro', 'club_agencia', 'destacado'].includes(planFromUrl)) {
      setFormData(prev => ({ ...prev, planType: planFromUrl }))
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Por favor, completa todos los campos')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
      setStep(2)
    }
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

    try {
      // Create account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          planType: formData.planType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la cuenta')
      }

      // Auto login after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Cuenta creada, pero error al iniciar sesión. Intenta iniciar sesión manualmente.')
      } else {
        // Redirect based on plan type
        if (formData.planType === 'pro_semipro' || formData.planType === 'destacado') {
          // Redirect to plans page to complete payment
          router.push('/planes')
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

  const handleOAuthRegister = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, { 
        callbackUrl: formData.planType === 'pro_semipro' ? '/checkout?plan=pro_semipro' : '/dashboard'
      })
    } catch (error) {
      setError('Error al conectar con el proveedor')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back Link */}
          <div>
            <Link 
              href={step === 1 ? "/" : "#"}
              onClick={step === 2 ? () => setStep(1) : undefined}
              className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 1 ? 'Volver al inicio' : 'Paso anterior'}
            </Link>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-workhoops-primary">
                Crear cuenta
              </CardTitle>
              <CardDescription>
                {step === 1 ? 'Únete a WorkHoops gratis' : 'Personaliza tu experiencia'}
              </CardDescription>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-workhoops-accent' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-workhoops-accent' : 'bg-gray-300'}`} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Continuar
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-4">
                    <Label>¿Cuál es tu rol en el baloncesto?</Label>
                    <div className="grid gap-3">
                      {roles.map((role) => (
                        <div
                          key={role.value}
                          onClick={() => handleInputChange('role', role.value)}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                            formData.role === role.value 
                              ? 'border-workhoops-accent bg-orange-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {role.icon}
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-gray-500">{role.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.role && formData.role !== 'club' && (
                    <div className="space-y-4">
                      <Label>Selecciona tu plan</Label>
                      <div className="grid gap-3">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            onClick={() => handleInputChange('planType', plan.id)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                              formData.planType === plan.id 
                                ? 'border-workhoops-accent bg-orange-50' 
                                : 'border-gray-200'
                            } ${plan.popular ? 'relative' : ''}`}
                          >
                            {plan.popular && (
                              <div className="absolute -top-2 -right-2">
                                <span className="bg-workhoops-accent text-white text-xs px-2 py-1 rounded-full">
                                  Popular
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{plan.name}</div>
                              <div className="font-bold text-workhoops-accent">{plan.price}</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {plan.features.join(' • ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {formData.planType === 'pro_semipro' ? 'Continuar al pago' : 'Crear cuenta gratis'}
                  </Button>
                </form>
              )}

              {step === 1 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O regístrate con</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthRegister('google')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthRegister('github')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-workhoops-accent hover:underline font-medium"
                >
                  Inicia sesión
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/legal/terminos" className="hover:underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/legal/privacidad" className="hover:underline">
              Política de Privacidad
            </Link>
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