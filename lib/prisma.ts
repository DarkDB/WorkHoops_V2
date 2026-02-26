import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure logging based on environment
const prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // Development: full logs
    : ['error'],                   // Production: only errors
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions)

// Avoid multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
