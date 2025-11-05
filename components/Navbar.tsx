'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  PlusCircle,
  BarChart3,
  FileText,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-workhoops-accent to-workhoops-accent-hover rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-workhoops-primary">WorkHoops</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/oportunidades" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>🏀</span>
              <span>Ofertas</span>
            </Link>
            <Link 
              href="/publicar" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>📝</span>
              <span>Publicar</span>
            </Link>
            <Link 
              href="/talento" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>⭐</span>
              <span>Talento</span>
            </Link>
            <Link 
              href="/talento/perfiles" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>👥</span>
              <span>Perfiles</span>
            </Link>
            <Link 
              href="/clubes" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>🏀</span>
              <span>Clubes</span>
            </Link>
            <Link 
              href="/recursos" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>📚</span>
              <span>Recursos</span>
            </Link>
            <Link 
              href="/planes" 
              className="flex items-center space-x-1 text-gray-600 hover:text-workhoops-accent transition-colors"
            >
              <span>💎</span>
              <span>Precios</span>
            </Link>
          </div>

          {/* Desktop/Tablet Auth Section */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* Admin Dashboard Button */}
                {session.user.role === 'admin' && (
                  <Link href="/dashboard/admin">
                    <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {/* Role-specific actions */}
                {(session.user.role === 'club' || session.user.role === 'agencia') && (
                  <Link href="/publicar">
                    <Button size="sm" className="bg-workhoops-accent hover:bg-workhoops-accent-hover">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </Link>
                )}

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                        <AvatarFallback>
                          {session.user.name ? getUserInitials(session.user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(session.user.role === 'jugador' || session.user.role === 'entrenador') && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/applications" className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          Mis Aplicaciones
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(session.user.role === 'club' || session.user.role === 'agencia') && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/opportunities" className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          Mis Oportunidades
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Favoritos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-workhoops-accent hover:bg-workhoops-accent-hover">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                href="/oportunidades"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>🏀</span>
                <span>Ofertas</span>
              </Link>
              <Link
                href="/publicar"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>📝</span>
                <span>Publicar</span>
              </Link>
              <Link
                href="/talento"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>⭐</span>
                <span>Talento</span>
              </Link>
              <Link
                href="/talento/perfiles"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>👥</span>
                <span>Perfiles</span>
              </Link>
              <Link
                href="/clubes"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>🏀</span>
                <span>Clubes</span>
              </Link>
              <Link
                href="/recursos"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>📚</span>
                <span>Recursos</span>
              </Link>
              <Link
                href="/sobre"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>🎯</span>
                <span>Sobre WorkHoops</span>
              </Link>
              <Link
                href="/planes"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>💎</span>
                <span>Precios</span>
              </Link>
              <Link
                href="/contacto"
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                onClick={() => setIsOpen(false)}
              >
                <span>📞</span>
                <span>Contacto</span>
              </Link>

              <div className="border-t pt-4">
                {session ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium text-gray-800">{session.user.name}</p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                    {session.user.role === 'admin' && (
                      <Link
                        href="/dashboard/admin"
                        className="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 bg-red-50 rounded-lg mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        🛡️ Panel de Administrador
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {(session.user.role === 'club' || session.user.role === 'agencia') && (
                      <Link
                        href="/publicar"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        Publicar Oportunidad
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-800"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-workhoops-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 text-base font-medium bg-workhoops-accent text-white rounded-md mx-3"
                      onClick={() => setIsOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}