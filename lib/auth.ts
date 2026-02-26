import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import crypto from 'crypto'

// Security constants
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

// Timing-safe comparison for OTP
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isOtp: { label: 'Is OTP', type: 'text' }, // "true" if using OTP
      },
      async authorize(credentials) {
        // Basic validation
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          return null
        }

        const email = credentials.email.toLowerCase().trim()
        const isOtpLogin = credentials.isOtp === 'true'

        try {
          // Load user with security fields
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              planType: true,
              passwordHash: true,
              isActive: true,
              failedLoginAttempts: true,
              lockedUntil: true,
              mustResetPassword: true,
            }
          })

          // Generic error to prevent user enumeration
          const genericError = () => {
            console.log('[AUTH] Invalid credentials for:', email)
            return null
          }

          // User not found - simulate timing to prevent enumeration
          if (!user) {
            await compare('dummy', '$2a$12$K.0HwpsoPDGaB/atFBmmYOGTW4ceG.kTgQDDGBTwwNJVd.h8Wzlwa')
            return genericError()
          }

          // User inactive
          if (!user.isActive) {
            console.log('[AUTH] Inactive user attempted login:', email)
            return genericError()
          }

          // User locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            console.log('[AUTH] Locked user attempted login:', email)
            return genericError()
          }

          // ========== FLOW 1: OTP LOGIN (for legacy users) ==========
          if (isOtpLogin || (!user.passwordHash && user.mustResetPassword)) {
            // User must have mustResetPassword=true and no passwordHash for OTP login
            if (!user.mustResetPassword) {
              console.log('[AUTH] OTP login attempted but user not in reset mode:', email)
              return genericError()
            }

            const otpCode = credentials.password.trim()
            
            // Validate OTP format (6 digits)
            if (!/^\d{6}$/.test(otpCode)) {
              console.log('[AUTH] Invalid OTP format:', email)
              return genericError()
            }

            // Find valid OTP token
            const otpTokens = await prisma.otpToken.findMany({
              where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
              },
              orderBy: { createdAt: 'desc' },
              take: 5, // Only check recent tokens
            })

            let validToken = null
            for (const token of otpTokens) {
              // Compare OTP with stored hash
              const isValid = await compare(otpCode, token.tokenHash)
              if (isValid) {
                validToken = token
                break
              }
            }

            if (!validToken) {
              console.log('[AUTH] Invalid OTP for user:', email)
              // Increment failed attempts
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: { increment: 1 },
                  lockedUntil: user.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS 
                    ? new Date(Date.now() + LOCKOUT_DURATION_MS)
                    : null
                }
              })
              return genericError()
            }

            // Mark OTP as used
            await prisma.otpToken.update({
              where: { id: validToken.id },
              data: { usedAt: new Date() }
            })

            // Reset failed attempts
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              }
            })

            console.log('[AUTH] Successful OTP login:', email)

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
              planType: user.planType,
              mustResetPassword: true, // Force password set
            }
          }

          // ========== FLOW 2: NORMAL PASSWORD LOGIN ==========
          
          // User without passwordHash but NOT in OTP mode - they need to request OTP first
          if (!user.passwordHash) {
            console.log('[AUTH] User without password attempted normal login:', email)
            return genericError()
          }

          // Verify password
          const isValidPassword = await compare(credentials.password, user.passwordHash)

          if (!isValidPassword) {
            // Increment failed attempts
            const newAttempts = (user.failedLoginAttempts || 0) + 1
            const updateData: any = { failedLoginAttempts: newAttempts }

            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
              updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
              console.log('[AUTH] User locked due to failed attempts:', email)
            }

            await prisma.user.update({
              where: { id: user.id },
              data: updateData
            })

            return genericError()
          }

          // ========== SUCCESSFUL LOGIN ==========
          // Reset failed attempts
          if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              }
            })
          }

          console.log('[AUTH] Successful login:', email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            planType: user.planType,
            mustResetPassword: user.mustResetPassword,
          }

        } catch (error) {
          console.error('[AUTH] Database error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).planType = token.planType as string
        ;(session.user as any).mustResetPassword = token.mustResetPassword as boolean
        if (token.image) {
          session.user.image = token.image as string
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
        ;(token as any).planType = (user as any).planType
        ;(token as any).mustResetPassword = (user as any).mustResetPassword || false
        if (user.image) {
          token.image = user.image
        }
      }
      
      // Session update (when calling update() from client)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.image) token.image = session.image
        if (typeof session.mustResetPassword === 'boolean') {
          ;(token as any).mustResetPassword = session.mustResetPassword
        }
      }
      
      return token
    },
  },
  events: {
    async signIn({ user }) {
      console.log('[AUTH] Sign in event:', user.email)
    },
    async signOut({ token }) {
      console.log('[AUTH] Sign out event:', token?.email)
    },
  },
}
