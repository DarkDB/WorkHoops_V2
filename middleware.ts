import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isPublish = req.nextUrl.pathname.startsWith('/publicar')
    const isAPI = req.nextUrl.pathname.startsWith('/api')

    // Allow auth pages for unauthenticated users
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    // Protect dashboard routes
    if (isDashboard && !isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }
      
      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Protect publish routes - only for organizations and admins
    if (isPublish) {
      if (!isAuth) {
        return NextResponse.redirect(
          new URL(`/auth/login?from=${encodeURIComponent(req.nextUrl.pathname)}`, req.url)
        )
      }

      if (!['org', 'admin'].includes(token?.role as string)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Rate limiting headers for API routes
    if (isAPI) {
      const response = NextResponse.next()
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
      
      return response
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This is called for every request
        // Return true to allow access, false to deny
        return true // Let the middleware function handle authorization logic
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}