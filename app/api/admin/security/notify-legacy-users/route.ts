import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/access'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limit for this endpoint
let lastExecutionTime: number | null = null
const MIN_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request: NextRequest) {
  try {
    // ========== AUTH CHECK ==========
    const session = await getServerSession(authOptions)
    
    const authError = requireAdminSession(session)
    if (authError) return authError

    // ========== RATE LIMIT ==========
    const now = Date.now()
    if (lastExecutionTime && (now - lastExecutionTime) < MIN_INTERVAL_MS) {
      const remainingMinutes = Math.ceil((MIN_INTERVAL_MS - (now - lastExecutionTime)) / 60000)
      return NextResponse.json(
        { 
          error: `Este endpoint solo puede ejecutarse una vez cada 10 minutos. Espera ${remainingMinutes} minutos.`,
          success: false 
        },
        { status: 429 }
      )
    }

    // ========== GET LEGACY USERS ==========
    const legacyUsers = await prisma.user.findMany({
      where: {
        passwordHash: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    if (legacyUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay usuarios legacy pendientes de migrar.',
        total: 0,
        sent: 0,
        failed: 0,
      })
    }

    // ========== SEND EMAILS ==========
    const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://workhoops.com'
    let sent = 0
    let failed = 0

    // Import email function
    const { getResendClient } = await import('@/lib/email')
    const resend = getResendClient()

    for (const user of legacyUsers) {
      try {
        await resend.emails.send({
          from: 'WorkHoops <hola@workhoops.com>',
          to: [user.email],
          subject: 'Actualización de seguridad: crea tu nueva contraseña',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF6A00 0%, #e55a00 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">WorkHoops</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Actualización de seguridad</p>
              </div>
              
              <div style="padding: 40px 20px; background: white;">
                <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${user.name || 'Usuario'},</h2>
                
                <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
                  Hemos actualizado nuestro sistema de seguridad para proteger mejor tu cuenta. 
                  <strong>Necesitas crear una nueva contraseña</strong> para seguir accediendo a WorkHoops.
                </p>
                
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Es muy fácil (menos de 1 minuto):</h3>
                  <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Haz clic en el botón de abajo</li>
                    <li>Introduce tu email</li>
                    <li>Recibirás un código de 6 dígitos</li>
                    <li>Crea tu nueva contraseña</li>
                  </ol>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${APP_URL}/auth/otp" 
                     style="display: inline-block; background: #FF6A00; color: white; padding: 14px 32px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Crear mi nueva contraseña
                  </a>
                </div>
                
                <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                  Si no solicitaste este cambio o no reconoces esta cuenta, puedes ignorar este email de forma segura.
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  © 2024 WorkHoops. Todos los derechos reservados.
                </p>
              </div>
            </div>
          `,
        })
        
        sent++
        
        // Small delay to avoid rate limits from Resend
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (emailError) {
        console.error(`[NOTIFY-LEGACY] Failed to send email to user ${user.id}:`, emailError)
        failed++
      }
    }

    // ========== UPDATE LAST EXECUTION TIME ==========
    lastExecutionTime = now

    // ========== LOG ACTION ==========
    console.log(`[NOTIFY-LEGACY] Admin ${session.user?.email} sent migration emails. Total: ${legacyUsers.length}, Sent: ${sent}, Failed: ${failed}`)

    return NextResponse.json({
      success: true,
      message: `Emails enviados correctamente.`,
      total: legacyUsers.length,
      sent,
      failed,
    })

  } catch (error) {
    console.error('[NOTIFY-LEGACY] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const authError = requireAdminSession(session)
    if (authError) return authError

    // Count legacy users
    const legacyCount = await prisma.user.count({
      where: {
        passwordHash: null,
        isActive: true,
      }
    })

    const canExecute = !lastExecutionTime || (Date.now() - lastExecutionTime) >= MIN_INTERVAL_MS
    const nextAvailable = lastExecutionTime 
      ? new Date(lastExecutionTime + MIN_INTERVAL_MS).toISOString()
      : null

    return NextResponse.json({
      legacyUsersCount: legacyCount,
      canExecuteNow: canExecute,
      nextAvailableAt: nextAvailable,
    })

  } catch (error) {
    console.error('[NOTIFY-LEGACY] GET Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
