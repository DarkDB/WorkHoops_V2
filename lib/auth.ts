import { NextAuthOptions } from 'next-auth'
import logger from '@/lib/logger'
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
          logger.warn('[AUTH] Missing credentials')
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
            logger.warn({ email }, '[AUTH] Invalid credentials')
            return null
          }

          // User not found - simulate timing to prevent enumeration
          if (!user) {
            await compare('dummy', '$2a$12$K.0HwpsoPDGaB/atFBmmYOGTW4ceG.kTgQDDGBTwwNJVd.h8Wzlwa')
            return genericError()
          }

          // User inactive
          if (!user.isActive) {
            logger.warn({ email }, '[AUTH] Inactive user attempted login')
            return genericError()
          }

          // User locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            logger.warn({ email }, '[AUTH] Locked user attempted login')
            return genericError()
          }

          // ========== FLOW 1: OTP LOGIN (for legacy users) ==========
          if (isOtpLogin || (!user.passwordHash && user.mustResetPassword)) {
            // User must have mustResetPassword=true and no passwordHash for OTP login
            if (!user.mustResetPassword) {
              logger.warn({ email }, '[AUTH] OTP login attempted but user not in reset mode')
              return genericError()
            }

            const otpCode = credentials.password.trim()
            
            // Validate OTP format (6 digits)
            if (!/^\d{6}$/.test(otpCode)) {
              logger.warn({ email }, '[AUTH] Invalid OTP format')
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
              logger.warn({ email }, '[AUTH] Invalid OTP for user')
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

            logger.info({ email }, '[AUTH] Successful OTP login')

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
            logger.warn({ email }, '[AUTH] User without password attempted normal login')
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
              logger.warn({ email }, '[AUTH] User locked due to failed attempts')
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

          logger.info({ email }, '[AUTH] Successful login')

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
          logger.error({ err: error }, '[AUTH] Database error')
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
      logger.info({ email: user.email }, '[AUTH] Sign in event')
    },
    async signOut({ token }) {
      logger.info({ email: token?.email }, '[AUTH] Sign out event')
    },
  },
}
