'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const EMAIL_ALREADY_EXISTS_PATTERNS = [
  'already exists',
  'ya existe',
  'already registered',
  'ya registrado',
  'email already',
  'duplicate',
]

function isEmailAlreadyExistsError(msg: string) {
  return EMAIL_ALREADY_EXISTS_PATTERNS.some(p => msg.toLowerCase().includes(p))
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailExistsError, setEmailExistsError] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/dashboard'
  // Pre-fill email if coming from register page
  const emailFromUrl = searchParams?.get('email') ?? ''
  const [emailValue, setEmailValue] = useState(emailFromUrl || email)

  const currentEmail = emailFromUrl ? emailValue : email
  const setCurrentEmail = emailFromUrl ? setEmailValue : setEmail

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setEmailExistsError(false)

    try {
      const result = await signIn('credentials', {
        email: currentEmail,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (isEmailAlreadyExistsError(result.error)) {
          setEmailExistsError(true)
        } else {
          setError('Email o contraseña incorrectos')
        }
      } else {
        await getSession()
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl })
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
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-workhoops-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
          </div>

          {/* Social proof */}
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏀</span>
              <div>
                <p className="font-semibold text-workhoops-primary text-sm">Bienvenido de nuevo</p>
                <p className="text-xs text-gray-500">Hay nuevas oportunidades esperándote.</p>
              </div>
            </div>
            <ul className="space-y-1">
              {[
                'Jugadores encontrando equipo cada semana',
                'Clubes publicando nuevas ofertas',
                'Mercado de verano activo ahora',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="pb-2 pt-6 px-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-workhoops-primary">Bienvenido de nuevo</h1>
                <p className="text-sm text-gray-500">Accede a tu cuenta de WorkHoops</p>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 space-y-4">
              {/* Email already exists error */}
              {emailExistsError && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="space-y-2">
                    <p className="text-orange-800 font-medium">Este email ya está registrado. ¿Quieres entrar?</p>
                    <Link
                      href={`/auth/login?email=${encodeURIComponent(currentEmail)}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        Ir a iniciar sesión
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {error && !emailExistsError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="space-y-3">
                    <p>{error}</p>
                    <div className="pt-2 border-t border-red-200">
                      <p className="text-sm text-red-700">
                        Si tu cuenta es anterior a la actualización de seguridad y no puedes entrar con tu contraseña,
                        entra con código (OTP) y crea una nueva contraseña.
                      </p>
                      <Link href="/auth/otp">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Entrar con código
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Google — CTA principal */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
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

              {/* Formulario email / contraseña */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-gray-500 hover:text-workhoops-accent hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full py-5 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar a WorkHoops
                </Button>
              </form>

              {/* OTP fallback — secundario, menos prominente */}
              <div className="text-center">
                <Link href="/auth/otp" className="text-xs text-gray-400 hover:text-workhoops-accent hover:underline">
                  Entrar con código (OTP)
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 px-6 pb-6">
              <div className="text-sm text-center text-gray-600">
                ¿Aún no tienes cuenta?{' '}
                <Link href="/auth/register" className="text-workhoops-accent hover:underline font-medium">
                  Es gratis →
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-gray-400">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/legal/terminos" className="hover:underline">Términos de Servicio</Link>
            {' '}y{' '}
            <Link href="/legal/privacidad" className="hover:underline">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
