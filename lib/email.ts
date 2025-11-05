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
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
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
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
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
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
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
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
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

export async function sendTalentContactEmail(
  talentEmail: string,
  talentName: string,
  contactName: string,
  contactEmail: string,
  contactMessage: string,
  profileUrl: string
) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `Nueva solicitud de contacto en WorkHoops`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6A00 0%, #e55a00 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Nueva solicitud de contacto</p>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${talentName}</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
              <strong>${contactName}</strong> está interesado en tu perfil y quiere contactarte.
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #FF6A00; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #111111; margin: 0 0 10px 0; font-size: 16px;">Mensaje:</h3>
              <p style="color: #666; margin: 0; line-height: 1.6; white-space: pre-wrap;">${contactMessage}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Datos de contacto:</strong><br/>
                Email: <a href="mailto:${contactEmail}" style="color: #FF6A00;">${contactEmail}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${profileUrl}" style="background: #FF6A00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Ver mi perfil
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
              Puedes responder directamente a ${contactName} usando el email proporcionado.
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
      console.error('Error sending talent contact email:', error)
      throw new Error('Failed to send talent contact email')
    }

    return data
  } catch (error) {
    console.error('Error sending talent contact email:', error)
    throw new Error('Failed to send talent contact email')
  }
}

export async function sendInterestNotificationEmail(
  talentEmail: string,
  talentName: string,
  interestedUserName: string,
  profileUrl: string
) {
  try {
    console.log('[RESEND] Attempting to send interest notification email')
    console.log('[RESEND] To:', talentEmail)
    console.log('[RESEND] From: WorkHoops <hola@workhoops.com>')
    console.log('[RESEND] API Key present:', !!process.env.RESEND_API_KEY)
    
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `Hay interés en tu perfil de WorkHoops`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6A00 0%, #e55a00 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">¡Alguien está interesado en tu perfil!</p>
          </div>
          
          <div style="padding: 40px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${talentName}</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
              <strong>${interestedUserName}</strong> ha mostrado interés en tu perfil pero no puede contactarte directamente porque aún no tienes el Plan Pro activo.
            </p>
            
            <div style="background: #FFF7ED; border: 2px solid #FF6A00; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #FF6A00; margin: 0 0 15px 0; font-size: 18px;">🚀 Activa el Plan Pro y desbloquea:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Recibe solicitudes de contacto directo</li>
                <li>Perfil destacado en búsquedas</li>
                <li>Acceso a todas las ofertas premium</li>
                <li>Estadísticas avanzadas de perfil</li>
              </ul>
              <p style="color: #FF6A00; margin: 15px 0 0 0; font-weight: bold; font-size: 18px;">
                Solo 4.99€/mes
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/planes" style="background: #FF6A00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Activar Plan Pro Ahora
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
              No pierdas oportunidades. Activa Pro y conecta con clubs y agencias.
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
      console.error('Error sending interest notification email:', error)
      throw new Error('Failed to send interest notification email')
    }

    return data
  } catch (error) {
    console.error('Error sending interest notification email:', error)
    throw new Error('Failed to send interest notification email')
  }
}