import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // For development, we'll create a simple user lookup
          // In production, you'd store hashed passwords in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // For now, we'll accept any password for existing users (development only!)
          // In production, you'd compare with stored hashed password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as "user" | "org" | "admin",
            planType: user.planType,
          }
        } catch (error) {
          console.error('Auth error:', error)
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
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
        ;(token as any).planType = (user as any).planType
      }
      return token
    },
  },
}