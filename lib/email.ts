import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

export async function sendMagicLinkEmail(email: string, url: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SUPPORT_EMAIL || 'noreply@workhoops.es',
      to: [email],
      subject: 'Accede a WorkHoops - Enlace mágico',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6A00 0%, #e55a00 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Tu plataforma de oportunidades de baloncesto</p>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Accede a tu cuenta</h2>
            <p style="color: #666; margin: 0 0 30px 0; line-height: 1.6;">
              Haz clic en el botón de abajo para acceder a WorkHoops. Este enlace es válido por 30 minutos.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background: #FF6A00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Acceder a WorkHoops
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0;">
              Si no solicitaste este enlace, puedes ignorar este email de forma segura.
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

    if (error) {
      console.error('Error sending magic link email:', error)
      throw new Error('Failed to send magic link email')
    }

    return data
  } catch (error) {
    console.error('Error sending magic link email:', error)
    throw new Error('Failed to send magic link email')
  }
}

export async function sendApplicationNotificationEmail(
  organizationEmail: string,
  applicantName: string,
  opportunityTitle: string,
  applicationId: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SUPPORT_EMAIL || 'noreply@workhoops.es',
      to: [organizationEmail],
      subject: `Nueva aplicación: ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #111111; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Aplicación</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Has recibido una nueva aplicación</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              <strong>${applicantName}</strong> ha aplicado a tu oportunidad: <strong>${opportunityTitle}</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/applications/${applicationId}" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Aplicación
              </a>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending application notification:', error)
      throw new Error('Failed to send application notification')
    }

    return data
  } catch (error) {
    console.error('Error sending application notification:', error)
    throw new Error('Failed to send application notification')
  }
}

export async function sendApplicationStateChangeEmail(
  applicantEmail: string,
  applicantName: string,
  opportunityTitle: string,
  newState: string
) {
  const stateMessages = {
    vista: 'Tu aplicación ha sido vista por el empleador',
    rechazada: 'Lamentablemente tu aplicación no ha sido seleccionada',
    aceptada: '¡Enhorabuena! Tu aplicación ha sido aceptada'
  }

  const stateColors = {
    vista: '#0EA5E9',
    rechazada: '#EF4444',
    aceptada: '#22C55E'
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SUPPORT_EMAIL || 'noreply@workhoops.es',
      to: [applicantEmail],
      subject: `Actualización de aplicación: ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${stateColors[newState as keyof typeof stateColors]}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Actualización de Aplicación</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${applicantName}</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              ${stateMessages[newState as keyof typeof stateMessages]} para la oportunidad: <strong>${opportunityTitle}</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/applications" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Mis Aplicaciones
              </a>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending application state change email:', error)
      throw new Error('Failed to send application state change email')
    }

    return data
  } catch (error) {
    console.error('Error sending application state change email:', error)
    throw new Error('Failed to send application state change email')
  }
}

export async function sendPaymentConfirmationEmail(
  organizationEmail: string,
  organizationName: string,
  opportunityTitle: string,
  plan: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SUPPORT_EMAIL || 'noreply@workhoops.es',
      to: [organizationEmail],
      subject: `Pago confirmado - ${opportunityTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22C55E; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡Pago Confirmado!</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${organizationName}</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              Tu pago ha sido procesado correctamente y tu oportunidad <strong>${opportunityTitle}</strong> 
              ha sido publicada con el plan <strong>${plan}</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/opportunities" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Mis Oportunidades
              </a>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending payment confirmation email:', error)
      throw new Error('Failed to send payment confirmation email')
    }

    return data
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
    throw new Error('Failed to send payment confirmation email')
  }
}