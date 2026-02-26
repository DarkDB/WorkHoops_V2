import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes requiring authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/publicar']

// Admin-only routes
const ADMIN_ROUTES = ['/admin']

// Auth routes (redirect if already authenticated)
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/otp']

// Route for setting password after OTP login
const SET_PASSWORD_ROUTE = '/auth/set-password'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes (except /api/admin)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ========== API ADMIN PROTECTION ==========
  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    if (token.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    return NextResponse.next()
  }

  // Skip other API routes (they have their own protection)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ========== GET JWT TOKEN ==========
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const isAdmin = token?.role === 'admin'
  const mustResetPassword = token?.mustResetPassword === true

  // ========== FORCE PASSWORD RESET ==========
  // If user must reset password, only allow /auth/set-password
  if (isAuthenticated && mustResetPassword) {
    if (pathname !== SET_PASSWORD_ROUTE && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL(SET_PASSWORD_ROUTE, request.url))
    }
  }

  // ========== REDIRECT AUTHENTICATED FROM AUTH ROUTES ==========
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  if (isAuthenticated && isAuthRoute && !mustResetPassword) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ========== PROTECT ROUTES ==========
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))

  // Not authenticated and trying to access protected route
  if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Not admin and trying to access admin route
  if (isAdminRoute && !isAdmin) {
    console.log('[MIDDLEWARE] Non-admin attempted to access:', pathname)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ========== SECURITY HEADERS ==========
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
