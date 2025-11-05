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
      console.error('[RESEND] Error from Resend API:', error)
      throw new Error('Failed to send interest notification email: ' + JSON.stringify(error))
    }

    console.log('[RESEND] Email sent successfully! ID:', data?.id)
    return data
  } catch (error) {
    console.error('[RESEND] Exception caught:', error)
    throw error
  }
}

// ==================== FASE 1: CORREOS INMEDIATOS ====================

export async function sendWelcomeEmail(
  userName: string,
  userEmail: string,
  userRole: string
) {
  try {
    console.log('[RESEND] Sending welcome email to:', userEmail)
    
    // Personalizar mensaje según rol
    const roleMessages = {
      jugador: {
        title: '¡Bienvenido a WorkHoops, Jugador!',
        description: 'Tu carrera profesional comienza aquí',
        nextSteps: [
          'Completa tu perfil de jugador con tus estadísticas y video',
          'Explora oportunidades disponibles en clubes de toda España',
          'Aplica a las ofertas que más te interesen',
          'Considera el Plan Pro para destacar tu perfil'
        ]
      },
      entrenador: {
        title: '¡Bienvenido a WorkHoops, Entrenador!',
        description: 'Conecta con equipos que necesitan tu experiencia',
        nextSteps: [
          'Completa tu perfil con tu filosofía y experiencia',
          'Explora oportunidades de coaching disponibles',
          'Aplica a las posiciones que encajen con tu estilo',
          'Activa el Plan Pro para acceso a ofertas premium'
        ]
      },
      club: {
        title: '¡Bienvenido a WorkHoops, Club!',
        description: 'Encuentra el talento que tu equipo necesita',
        nextSteps: [
          'Completa el perfil de tu club/agencia',
          'Publica tu primera oportunidad',
          'Explora perfiles de jugadores y entrenadores',
          'Usa el Plan Pro para contactar talentos directamente'
        ]
      }
    }

    const roleData = roleMessages[userRole as keyof typeof roleMessages] || roleMessages.jugador

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [userEmail],
      subject: '¡Bienvenido a WorkHoops! 🏀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6A00 0%, #e55a00 100%); padding: 50px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🏀 WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px;">${roleData.description}</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #111111; margin: 0 0 10px 0; font-size: 24px;">${roleData.title}</h2>
            <p style="color: #666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
              Hola <strong>${userName}</strong>, ¡estamos encantados de tenerte en nuestra comunidad de baloncesto!
            </p>

            <div style="background: #FFF7ED; border-left: 4px solid #FF6A00; padding: 25px; margin: 30px 0; border-radius: 4px;">
              <h3 style="color: #FF6A00; margin: 0 0 15px 0; font-size: 18px;">📋 Próximos Pasos</h3>
              <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 2;">
                ${roleData.nextSteps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.APP_URL}/profile/complete" style="background: #FF6A00; color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Completar Mi Perfil
              </a>
            </div>

            <div style="background: #f8f9fa; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
                <strong>Enlaces útiles:</strong>
              </p>
              <p style="margin: 8px 0;">
                <a href="${process.env.APP_URL}/oportunidades" style="color: #FF6A00; text-decoration: none; font-weight: 500;">Ver Oportunidades</a> • 
                <a href="${process.env.APP_URL}/talento/perfiles" style="color: #FF6A00; text-decoration: none; font-weight: 500;">Explorar Talentos</a> • 
                <a href="${process.env.APP_URL}/planes" style="color: #FF6A00; text-decoration: none; font-weight: 500;">Ver Planes</a>
              </p>
            </div>

            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6; text-align: center;">
              Si tienes alguna pregunta, responde este email o visita nuestra sección de ayuda.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © 2024 WorkHoops. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[RESEND] Error sending welcome email:', error)
      throw new Error('Failed to send welcome email: ' + JSON.stringify(error))
    }

    console.log('[RESEND] Welcome email sent successfully! ID:', data?.id)
    return data
  } catch (error) {
    console.error('[RESEND] Exception in sendWelcomeEmail:', error)
    throw error
  }
}

export async function sendProfileCompletedEmail(
  userName: string,
  userEmail: string,
  userRole: string,
  profileUrl: string
) {
  try {
    console.log('[RESEND] Sending profile completed email to:', userEmail)
    
    const roleNames = {
      jugador: 'Jugador',
      entrenador: 'Entrenador',
      club: 'Club/Agencia'
    }

    const roleName = roleNames[userRole as keyof typeof roleNames] || 'Usuario'

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [userEmail],
      subject: '🎉 ¡Tu perfil está completo!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 50px 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">¡Perfil Completado!</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">Tu perfil de ${roleName} está 100% completo</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #111111; margin: 0 0 10px 0; font-size: 22px;">¡Excelente trabajo, ${userName}!</h2>
            <p style="color: #666; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
              Has completado tu perfil al 100%. Esto significa que tu perfil ahora es visible para todos los usuarios de WorkHoops y aparecerás en las búsquedas.
            </p>

            <div style="background: #F0FDF4; border: 2px solid #22C55E; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #16A34A; margin: 0 0 15px 0; font-size: 18px;">✅ Ahora puedes:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 2;">
                <li>Aparecer en búsquedas de ${userRole === 'club' ? 'talentos' : 'clubs y agencias'}</li>
                <li>Recibir notificaciones de interés en tu perfil</li>
                <li>Aplicar a más oportunidades con un perfil destacado</li>
                <li>Aumentar tus probabilidades de ser contactado</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${profileUrl}" style="background: #22C55E; color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver Mi Perfil Público
              </a>
            </div>

            ${userRole !== 'club' ? `
            <div style="background: #FFF7ED; border-left: 4px solid #FF6A00; padding: 25px; margin: 30px 0; border-radius: 4px;">
              <h3 style="color: #FF6A00; margin: 0 0 10px 0; font-size: 16px;">💡 Consejo Pro</h3>
              <p style="color: #666; margin: 0; line-height: 1.6;">
                Con el <strong>Plan Pro</strong> (4.99€/mes), tu perfil aparecerá destacado en las búsquedas y recibirás contacto directo de clubs y agencias.
              </p>
              <p style="margin: 15px 0 0 0; text-align: center;">
                <a href="${process.env.APP_URL}/planes" style="color: #FF6A00; text-decoration: none; font-weight: bold;">
                  Ver Plan Pro →
                </a>
              </p>
            </div>
            ` : `
            <div style="background: #FFF7ED; border-left: 4px solid #FF6A00; padding: 25px; margin: 30px 0; border-radius: 4px;">
              <h3 style="color: #FF6A00; margin: 0 0 10px 0; font-size: 16px;">💡 Próximos Pasos</h3>
              <p style="color: #666; margin: 0; line-height: 1.6;">
                Explora perfiles de jugadores y entrenadores. Con el <strong>Plan Pro</strong>, puedes contactarlos directamente.
              </p>
              <p style="margin: 15px 0 0 0; text-align: center;">
                <a href="${process.env.APP_URL}/talento/perfiles" style="color: #FF6A00; text-decoration: none; font-weight: bold;">
                  Explorar Talentos →
                </a>
              </p>
            </div>
            `}

            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6; text-align: center;">
              Recuerda mantener tu perfil actualizado para mejores resultados.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © 2024 WorkHoops. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[RESEND] Error sending profile completed email:', error)
      throw new Error('Failed to send profile completed email: ' + JSON.stringify(error))
    }

    console.log('[RESEND] Profile completed email sent successfully! ID:', data?.id)
    return data
  } catch (error) {
    console.error('[RESEND] Exception in sendProfileCompletedEmail:', error)
    throw error
  }
}

export async function sendAdminWelcomeEmail(
  adminName: string,
  adminEmail: string
) {
  try {
    console.log('[RESEND] Sending admin welcome email to:', adminEmail)
    
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [adminEmail],
      subject: '🛡️ Bienvenido al Panel de Administración - WorkHoops',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 50px 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 15px;">🛡️</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Panel de Administración</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">Acceso administrativo activado</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #111111; margin: 0 0 10px 0; font-size: 22px;">¡Bienvenido, ${adminName}!</h2>
            <p style="color: #666; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
              Se te ha otorgado acceso de <strong>Administrador</strong> en WorkHoops. Ahora tienes permisos especiales para gestionar la plataforma.
            </p>

            <div style="background: #EEF2FF; border: 2px solid #6366F1; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #4F46E5; margin: 0 0 15px 0; font-size: 18px;">🔧 Capacidades de Administrador</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 2;">
                <li><strong>Gestión de Usuarios:</strong> Ver, editar y administrar todos los usuarios</li>
                <li><strong>Oportunidades:</strong> Aprobar, editar o eliminar cualquier oportunidad publicada</li>
                <li><strong>Recursos:</strong> Crear y gestionar recursos de la plataforma</li>
                <li><strong>Aplicaciones:</strong> Ver todas las aplicaciones y su estado</li>
                <li><strong>Analíticas:</strong> Acceso a estadísticas y métricas de la plataforma</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.APP_URL}/admin" style="background: #6366F1; color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Acceder al Panel Admin
              </a>
            </div>

            <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h3 style="color: #DC2626; margin: 0 0 10px 0; font-size: 16px;">⚠️ Importante</h3>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 14px;">
                Con grandes poderes vienen grandes responsabilidades. Por favor, usa tus permisos de administrador de manera responsable y profesional. Todas las acciones administrativas quedan registradas.
              </p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <h3 style="color: #111111; margin: 0 0 15px 0; font-size: 16px;">📚 Accesos Rápidos</h3>
              <p style="margin: 8px 0;">
                <a href="${process.env.APP_URL}/admin" style="color: #6366F1; text-decoration: none; font-weight: 500;">Panel Admin</a> • 
                <a href="${process.env.APP_URL}/admin/users" style="color: #6366F1; text-decoration: none; font-weight: 500;">Usuarios</a> • 
                <a href="${process.env.APP_URL}/admin/opportunities" style="color: #6366F1; text-decoration: none; font-weight: 500;">Oportunidades</a> • 
                <a href="${process.env.APP_URL}/admin/resources" style="color: #6366F1; text-decoration: none; font-weight: 500;">Recursos</a>
              </p>
            </div>

            <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6; text-align: center;">
              Si tienes preguntas sobre tus responsabilidades, contacta al equipo de WorkHoops.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © 2024 WorkHoops. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[RESEND] Error sending admin welcome email:', error)
      throw new Error('Failed to send admin welcome email: ' + JSON.stringify(error))
    }

    console.log('[RESEND] Admin welcome email sent successfully! ID:', data?.id)
    return data
  } catch (error) {
    console.error('[RESEND] Exception in sendAdminWelcomeEmail:', error)
    throw error
  }
}