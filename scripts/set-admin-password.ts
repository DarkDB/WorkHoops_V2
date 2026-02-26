/**
 * Script to set admin password
 * 
 * Usage:
 *   ADMIN_NEW_PASSWORD="YourSecurePassword123" npx ts-node scripts/set-admin-password.ts
 * 
 * Or with tsx:
 *   ADMIN_NEW_PASSWORD="YourSecurePassword123" npx tsx scripts/set-admin-password.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const ADMIN_EMAIL = 'admin@workhoops.com'

async function main() {
  const password = process.env.ADMIN_NEW_PASSWORD

  if (!password) {
    console.error('❌ Error: ADMIN_NEW_PASSWORD environment variable is required')
    console.error('')
    console.error('Usage:')
    console.error('  ADMIN_NEW_PASSWORD="YourSecurePassword123" npx tsx scripts/set-admin-password.ts')
    process.exit(1)
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters')
    process.exit(1)
  }
  if (!/[A-Z]/.test(password)) {
    console.error('❌ Error: Password must contain at least one uppercase letter')
    process.exit(1)
  }
  if (!/[a-z]/.test(password)) {
    console.error('❌ Error: Password must contain at least one lowercase letter')
    process.exit(1)
  }
  if (!/[0-9]/.test(password)) {
    console.error('❌ Error: Password must contain at least one number')
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    console.log(`🔐 Setting password for admin: ${ADMIN_EMAIL}`)
    
    // Hash password
    const passwordHash = await hash(password, 12)
    console.log('✅ Password hashed')

    // Update admin user
    const user = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
        mustResetPassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        isActive: true,
        role: 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    console.log('✅ Admin password set successfully!')
    console.log('')
    console.log('User details:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log('')
    console.log('🎉 Done! You can now login with the new password.')

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`❌ Error: Admin user with email "${ADMIN_EMAIL}" not found`)
      console.error('')
      console.error('Make sure the admin user exists in the database.')
    } else {
      console.error('❌ Error:', error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
