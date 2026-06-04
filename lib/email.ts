import { Resend } from 'resend'
import logger from '@/lib/logger'

let resend: Resend | null = null
const APP_URL = process.env.APP_URL || 'https://workhoops.es'
const CURRENT_YEAR = new Date().getFullYear()

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Shared footer HTML
const FOOTER_HTML = `
  <div style="background: #0f0f1a; padding: 24px 20px; text-align: center; border-top: 1px solid #1e1e2e;">
    <p style="color: #888; font-size: 13px; margin: 0 0 6px 0; font-family: system-ui, -apple-system, Arial, sans-serif;">
      <strong style="color: #FF6B1A;">WorkHoops</strong> · La plataforma de baloncesto · <a href="https://workhoops.com" style="color: #FF6B1A; text-decoration: none;">workhoops.com</a>
    </p>
    <p style="color: #555; font-size: 12px; margin: 0;">
      <a href="${APP_URL}/unsubscribe" style="color: #555; text-decoration: underline;">Darte de baja</a>
    </p>
  </div>
`

export function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

// ========== OTP EMAIL FOR MIGRATION ==========
export async function sendOtpEmail(email: string, name: string, otpCode: string) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [email],
      subject: 'Tu código de acceso - WorkHoops',
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px;">La plataforma de baloncesto</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 16px 0; font-size: 22px;">Hola, ${name}</h2>
            <p style="color: #555; margin: 0 0 32px 0; line-height: 1.7; font-size: 15px;">
              Hemos actualizado nuestro sistema de seguridad. Usa el siguiente código para acceder a tu cuenta:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <div style="background: #fafafa; border: 2px dashed #FF6B1A; border-radius: 12px; padding: 24px 32px; display: inline-block;">
                <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #FF6B1A; font-family: monospace;">${otpCode}</span>
              </div>
            </div>

            <p style="color: #555; margin: 24px 0; line-height: 1.7; font-size: 15px;">
              Este código es válido por <strong>10 minutos</strong>. Después de acceder, se te pedirá que crees una contraseña nueva.
            </p>

            <p style="color: #aaa; font-size: 13px; margin: 40px 0 0 0; border-top: 1px solid #f0f0f0; padding-top: 20px;">
              Si no solicitaste este código, puedes ignorar este email de forma segura.
            </p>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending OTP email')
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error in sendOtpEmail')
    throw error
  }
}


export async function sendMagicLinkEmail(email: string, url: string) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [email],
      subject: 'Tu enlace de acceso a WorkHoops',
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px;">La plataforma de baloncesto</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 16px 0; font-size: 22px;">Accede a tu cuenta</h2>
            <p style="color: #555; margin: 0 0 36px 0; line-height: 1.7; font-size: 15px;">
              Haz clic en el botón de abajo para acceder a WorkHoops. Este enlace caduca en <strong>30 minutos</strong>.
            </p>

            <div style="text-align: center; margin: 36px 0;">
              <a href="${url}" style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Acceder a WorkHoops
              </a>
            </div>

            <p style="color: #aaa; font-size: 13px; margin: 40px 0 0 0; border-top: 1px solid #f0f0f0; padding-top: 20px;">
              Si no solicitaste este enlace, puedes ignorar este email de forma segura.
            </p>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending magic link email')
      throw new Error('Failed to send magic link email')
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending magic link email')
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
      subject: `${applicantName} ha aplicado a "${opportunityTitle}"`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nueva candidatura recibida</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 8px 0; font-size: 24px;">Un nuevo jugador quiere unirse a tu equipo</h2>
            <p style="color: #888; margin: 0 0 32px 0; font-size: 14px;">Revísalo antes de que otros clubes le hagan una oferta</p>

            <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 40px; height: 40px; background: #FF6B1A; border-radius: 50%; display: inline-block; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px; margin-right: 14px; vertical-align: middle;">${escapeHtml(applicantName).charAt(0).toUpperCase()}</div>
                <div style="display: inline-block; vertical-align: middle;">
                  <p style="margin: 0; font-weight: bold; color: #111; font-size: 17px;">${escapeHtml(applicantName)}</p>
                  <p style="margin: 0; color: #888; font-size: 13px;">Ha aplicado a: <strong>${escapeHtml(opportunityTitle)}</strong></p>
                </div>
              </div>
            </div>

            <div style="background: #fff8f5; border-left: 4px solid #FF6B1A; padding: 16px 20px; border-radius: 4px; margin: 0 0 32px 0;">
              <p style="margin: 0; color: #c44a00; font-size: 14px; font-weight: 600;">
                Los mejores perfiles reciben múltiples ofertas. Responde pronto y no pierdas a este candidato.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0 0 0;">
              <a href="${APP_URL}/dashboard/applications"
                 style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver la candidatura ahora
              </a>
            </div>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending application notification')
      throw new Error('Failed to send application notification')
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending application notification')
    throw new Error('Failed to send application notification')
  }
}

export async function sendApplicationStateChangeEmail(
  applicantEmail: string,
  applicantName: string,
  opportunityTitle: string,
  newState: string
) {
  type StateKey = 'vista' | 'rechazada' | 'aceptada'

  const stateConfig: Record<StateKey, { subject: string; headerBg: string; headerText: string; body: string; cta: string; ctaColor: string }> = {
    vista: {
      subject: `El club ha revisado tu candidatura a "${opportunityTitle}"`,
      headerBg: '#0f0f1a',
      headerText: 'Estás en su radar 👀',
      body: `
        <h2 style="color: #111; margin: 0 0 12px 0; font-size: 24px;">El club ha visto tu perfil, ${applicantName.split(' ')[0]}</h2>
        <p style="color: #555; margin: 0 0 20px 0; line-height: 1.7; font-size: 15px;">
          Tu candidatura a <strong>${escapeHtml(opportunityTitle)}</strong> ha sido revisada por el equipo de selección.
          Eso significa que <strong>estás en su radar</strong> — sigue pendiente, puede llegar buenas noticias.
        </p>
        <div style="background: #f0f9ff; border-left: 4px solid #0EA5E9; padding: 16px 20px; border-radius: 4px; margin: 0 0 32px 0;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            Mientras tanto, puedes seguir explorando otras oportunidades en WorkHoops. Los jugadores activos tienen más posibilidades.
          </p>
        </div>
      `,
      cta: 'Ver mis candidaturas',
      ctaColor: '#0EA5E9',
    },
    aceptada: {
      subject: `¡Lo conseguiste! Tu candidatura a "${opportunityTitle}" ha sido aceptada`,
      headerBg: '#052e16',
      headerText: '🎉🏀 ¡Enhorabuena!',
      body: `
        <h2 style="color: #111; margin: 0 0 12px 0; font-size: 26px;">¡Lo conseguiste, ${applicantName.split(' ')[0]}!</h2>
        <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
          Tu candidatura a <strong>${escapeHtml(opportunityTitle)}</strong> ha sido <strong style="color: #16A34A;">ACEPTADA</strong>.
          Todo el trabajo, los entrenos y la dedicación han dado su fruto. Este es tu momento.
        </p>
        <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #22C55E; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 32px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🏀🎊🏆</div>
          <p style="margin: 0; color: #16A34A; font-size: 18px; font-weight: bold;">
            El club te espera. Revisa tu bandeja de entrada para los próximos pasos.
          </p>
        </div>
        <p style="color: #888; font-size: 14px; margin: 0 0 32px 0; line-height: 1.6;">
          Accede a tu panel para ver los detalles de la oferta y ponerte en contacto con el club.
        </p>
      `,
      cta: 'Ver mi oferta aceptada',
      ctaColor: '#16A34A',
    },
    rechazada: {
      subject: `Actualización sobre tu candidatura a "${opportunityTitle}"`,
      headerBg: '#0f0f1a',
      headerText: 'Sobre tu candidatura',
      body: `
        <h2 style="color: #111; margin: 0 0 12px 0; font-size: 22px;">Hola, ${applicantName.split(' ')[0]}</h2>
        <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
          Esta vez el club ha decidido avanzar con otro perfil para <strong>${escapeHtml(opportunityTitle)}</strong>.
          Sabemos que no es la noticia que esperabas, pero es parte del proceso.
        </p>
        <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; font-weight: 600;">Tu perfil sigue activo y visible para todos los clubes</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
            En WorkHoops hay nuevas oportunidades cada semana. Los jugadores que siguen activos y aplican a más ofertas son los que acaban encontrando su equipo.
          </p>
        </div>
        <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
          No te detengas — tu siguiente oportunidad puede estar a un clic.
        </p>
      `,
      cta: 'Explorar más oportunidades',
      ctaColor: '#FF6B1A',
    },
  }

  const config = stateConfig[newState as StateKey] ?? stateConfig.vista

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [applicantEmail],
      subject: config.subject,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${config.headerBg}; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${config.headerText}</h1>
            <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0 0; font-size: 13px;">WorkHoops · La plataforma de baloncesto</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            ${config.body}
            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/applications"
                 style="background: ${config.ctaColor}; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                ${config.cta}
              </a>
            </div>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending application state change email')
      throw new Error('Failed to send application state change email')
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending application state change email')
    throw new Error('Failed to send application state change email')
  }
}

export async function sendPaymentConfirmationEmail(
  organizationEmail: string,
  organizationName: string,
  opportunityTitle: string,
  plan: string
) {
  const planBenefits: Record<string, string[]> = {
    basic: [
      'Publicación activa durante 30 días',
      'Visibilidad para todos los jugadores de WorkHoops',
      'Recepción de candidaturas sin límite',
      'Panel de gestión de candidatos',
    ],
    pro: [
      'Publicación activa durante 60 días',
      'Posición destacada en los resultados de búsqueda',
      'Contacto directo con jugadores Pro',
      'Estadísticas avanzadas de la oferta',
      'Soporte prioritario',
    ],
    premium: [
      'Publicación activa durante 90 días',
      'Máxima visibilidad — aparece primero',
      'Acceso ilimitado al directorio de talento',
      'Contacto directo con todos los perfiles',
      'Gestor de cuenta dedicado',
      'Informe de métricas de reclutamiento',
    ],
  }

  const benefits = planBenefits[plan.toLowerCase()] ?? planBenefits.basic

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [organizationEmail],
      subject: `¡Pago confirmado! "${opportunityTitle}" ya está publicada`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <div style="font-size: 52px; margin-bottom: 12px;">🎉</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">¡Pago confirmado!</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Tu oferta ya está activa</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 8px 0; font-size: 22px;">¡Listo, ${escapeHtml(organizationName)}!</h2>
            <p style="color: #555; margin: 0 0 32px 0; line-height: 1.7; font-size: 15px;">
              Tu pago ha sido procesado correctamente. La oferta <strong>"${escapeHtml(opportunityTitle)}"</strong> está publicada con el <strong>Plan ${escapeHtml(plan)}</strong> y ya puede ser vista por los jugadores de WorkHoops.
            </p>

            <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
              <h3 style="color: #111; margin: 0 0 16px 0; font-size: 16px; font-weight: 700;">Lo que incluye tu Plan ${escapeHtml(plan)}:</h3>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
                ${benefits.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>

            <div style="background: #fff8f5; border-left: 4px solid #FF6B1A; padding: 16px 20px; border-radius: 4px; margin: 0 0 32px 0;">
              <p style="margin: 0; color: #c44a00; font-size: 14px; line-height: 1.6;">
                <strong>Consejo:</strong> Responde rápido a los candidatos — los mejores perfiles también están evaluando otras ofertas.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard"
                 style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver mis oportunidades publicadas
              </a>
            </div>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending payment confirmation email')
      throw new Error('Failed to send payment confirmation email')
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending payment confirmation email')
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
    const safeTalentName = escapeHtml(talentName)
    const safeContactName = escapeHtml(contactName)
    const safeContactEmail = escapeHtml(contactEmail)
    const safeContactMessage = escapeHtml(contactMessage)
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `${safeContactName} quiere contactarte en WorkHoops`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nueva solicitud de contacto</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 12px 0; font-size: 22px;">Hola, ${safeTalentName}</h2>
            <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
              <strong>${safeContactName}</strong> ha revisado tu perfil y quiere ponerse en contacto contigo directamente.
            </p>

            <div style="background: #fafafa; border-left: 4px solid #FF6B1A; padding: 20px 24px; margin: 0 0 20px 0; border-radius: 4px;">
              <h3 style="color: #111; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">Mensaje:</h3>
              <p style="color: #555; margin: 0; line-height: 1.7; white-space: pre-wrap; font-size: 14px;">${safeContactMessage}</p>
            </div>

            <div style="background: #fafafa; padding: 16px 20px; margin: 0 0 32px 0; border-radius: 8px; border: 1px solid #f0f0f0;">
              <p style="color: #555; margin: 0; font-size: 14px;">
                <strong>Datos de contacto:</strong><br/>
                Email: <a href="mailto:${safeContactEmail}" style="color: #FF6B1A;">${safeContactEmail}</a>
              </p>
            </div>

            <div style="text-align: center; margin: 0 0 16px 0;">
              <a href="${profileUrl}" style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver mi perfil
              </a>
            </div>

            <p style="color: #aaa; font-size: 13px; margin: 24px 0 0 0; line-height: 1.6; text-align: center;">
              Puedes responder directamente a ${safeContactName} usando el email proporcionado.
            </p>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, 'Error sending talent contact email')
      throw new Error('Failed to send talent contact email')
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending talent contact email')
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
    const safeTalentName = escapeHtml(talentName)
    const safeInterestedUserName = escapeHtml(interestedUserName)
    logger.info('[RESEND] Attempting to send interest notification email')
    logger.info({ to: talentEmail }, '[RESEND] To')
    logger.info('[RESEND] From: WorkHoops <hola@workhoops.com>')
    logger.info({ apiKeyPresent: !!process.env.RESEND_API_KEY }, '[RESEND] API Key present')

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `${safeInterestedUserName} está interesado en tu perfil`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">¡Alguien está interesado en ti!</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 12px 0; font-size: 22px;">Hola, ${safeTalentName}</h2>
            <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
              <strong>${safeInterestedUserName}</strong> ha mostrado interés en tu perfil de WorkHoops.
            </p>

            <div style="background: #fff8f5; border: 2px solid #FF6B1A; padding: 28px 24px; margin: 0 0 32px 0; border-radius: 10px;">
              <h3 style="color: #FF6B1A; margin: 0 0 16px 0; font-size: 17px; font-weight: 700;">Activa el Plan Pro y desbloquea:</h3>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
                <li>Más visibilidad en búsquedas de clubes</li>
                <li>Perfil destacado en resultados</li>
                <li>Acceso a todas las ofertas premium</li>
                <li>Estadísticas avanzadas de perfil</li>
              </ul>
              <p style="color: #FF6B1A; margin: 20px 0 0 0; font-weight: bold; font-size: 20px; text-align: center;">
                Solo 4.99€/mes
              </p>
            </div>

            <div style="text-align: center; margin: 0 0 16px 0;">
              <a href="${APP_URL}/planes" style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Activar Plan Pro Ahora
              </a>
            </div>

            <p style="color: #aaa; font-size: 13px; margin: 24px 0 0 0; text-align: center;">
              No pierdas oportunidades. Activa Pro y conecta con clubs y agencias.
            </p>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, '[RESEND] Error from Resend API')
      throw new Error('Failed to send interest notification email: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[RESEND] Email sent successfully')
    return data
  } catch (error) {
    logger.error({ err: error }, '[RESEND] Exception caught')
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
    logger.info({ to: userEmail }, '[RESEND] Sending welcome email')

    type RoleKey = 'jugador' | 'entrenador' | 'club'

    const roleContent: Record<RoleKey, { subject: string; headline: string; subheadline: string; body: string; ctaLabel: string; ctaUrl: string }> = {
      jugador: {
        subject: '¡Bienvenido a WorkHoops! Este verano puede cambiar tu carrera',
        headline: 'Tu carrera empieza ahora, ' + userName.split(' ')[0],
        subheadline: 'Los clubes ya están buscando jugadores como tú',
        body: `
          <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
            Has dado el primer paso. Este verano puede ser diferente — puede ser el verano en que un club te encuentre, te vea jugar y te haga una oferta.
          </p>
          <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
            En WorkHoops, los clubes buscan activamente jugadores. Con un perfil completo, <strong>ellos te encuentran a ti</strong>. No al revés.
          </p>
          <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
            <h3 style="color: #111; margin: 0 0 14px 0; font-size: 15px; font-weight: 700;">Empieza por aquí:</h3>
            <ol style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
              <li>Completa tu perfil con estadísticas y vídeo de juego</li>
              <li>Explora oportunidades en clubes de toda España</li>
              <li>Aplica a las ofertas que encajen con tu nivel</li>
              <li>Activa el Plan Pro para destacar sobre el resto</li>
            </ol>
          </div>
        `,
        ctaLabel: 'Completar mi perfil ahora',
        ctaUrl: `${APP_URL}/profile/complete`,
      },
      entrenador: {
        subject: '¡Bienvenido a WorkHoops! Tu filosofía de juego merece ser vista',
        headline: 'Bienvenido, ' + userName.split(' ')[0],
        subheadline: 'Los equipos que necesitan tu experiencia están aquí',
        body: `
          <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
            Tu metodología, tu visión del juego y tus años de experiencia tienen valor. En WorkHoops, los clubes no solo buscan resultados — buscan entrenadores con una filosofía clara.
          </p>
          <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
            Un perfil completo te posiciona como el profesional que eres y <strong>pone tu propuesta de valor frente a los decisores</strong>.
          </p>
          <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
            <h3 style="color: #111; margin: 0 0 14px 0; font-size: 15px; font-weight: 700;">Próximos pasos:</h3>
            <ol style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
              <li>Detalla tu filosofía de juego y trayectoria</li>
              <li>Explora oportunidades de coaching disponibles</li>
              <li>Aplica a las posiciones que encajen con tu perfil</li>
              <li>Activa el Plan Pro para acceso a ofertas premium</li>
            </ol>
          </div>
        `,
        ctaLabel: 'Completar mi perfil',
        ctaUrl: `${APP_URL}/profile/complete`,
      },
      club: {
        subject: '¡Bienvenido a WorkHoops! Miles de jugadores ya buscan equipo',
        headline: 'Bienvenido, ' + userName.split(' ')[0],
        subheadline: 'El talento que necesitas ya está en WorkHoops',
        body: `
          <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
            Miles de jugadores y entrenadores tienen su perfil activo en WorkHoops ahora mismo. El proceso de reclutamiento nunca ha sido tan eficiente.
          </p>
          <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
            Publica tu primera oferta, define el perfil que buscas y recibe candidaturas de jugadores verificados. Sin intermediarios, sin comisiones ocultas.
          </p>
          <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
            <h3 style="color: #111; margin: 0 0 14px 0; font-size: 15px; font-weight: 700;">Empieza en 3 pasos:</h3>
            <ol style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
              <li>Completa el perfil de tu club con logo y descripción</li>
              <li>Publica tu primera oportunidad en menos de 5 minutos</li>
              <li>Revisa las candidaturas desde tu panel de reclutamiento</li>
            </ol>
          </div>
        `,
        ctaLabel: 'Publicar mi primera oferta',
        ctaUrl: `${APP_URL}/dashboard/opportunities/new`,
      },
    }

    const content = roleContent[userRole as RoleKey] ?? roleContent.jugador

    const banners: Record<string, string> = {
      jugador: `<div style="background: linear-gradient(135deg, #FF6B1A, #e05a10); padding: 28px 36px;">
        <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Este verano puede cambiar tu carrera, ${userName.split(' ')[0]} 🔥</h2>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; line-height: 1.5;">Los clubes ya están buscando jugadores. ¿Está tu perfil listo?</p>
      </div>`,
      entrenador: `<div style="background: linear-gradient(135deg, #1e3a5f, #0f2a4a); padding: 28px 36px;">
        <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Tu filosofía de juego merece ser vista, ${userName.split(' ')[0]} 🎯</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px; line-height: 1.5;">Los clubes no contratan al mejor entrenador. Contratan al que aparece primero.</p>
      </div>`,
      club: `<div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 28px 36px;">
        <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Miles de jugadores ya buscan equipo en WorkHoops 🏀</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px; line-height: 1.5;">Publica tu primera oferta en 5 minutos. Sin WhatsApps, sin intermediarios.</p>
      </div>`,
    }

    const progressColor: Record<string, string> = {
      jugador: '#FF6B1A',
      entrenador: '#0EA5E9',
      club: '#16A34A',
    }

    const banner = banners[userRole] ?? banners.jugador
    const pColor = progressColor[userRole] ?? '#FF6B1A'

    const clubStats = userRole === 'club' ? `
      <div style="display: flex; gap: 12px; margin: 0 0 28px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 130px; background: #fff7ed; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #FF6B1A; font-weight: 800; font-size: 22px; margin: 4px 0;">+500</p>
          <p style="color: #888; font-size: 12px; margin: 0;">Jugadores activos</p>
        </div>
        <div style="flex: 1; min-width: 130px; background: #f0fdf4; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #16A34A; font-weight: 800; font-size: 22px; margin: 4px 0;">+80</p>
          <p style="color: #888; font-size: 12px; margin: 0;">Entrenadores</p>
        </div>
        <div style="flex: 1; min-width: 130px; background: #f0f9ff; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #0EA5E9; font-weight: 800; font-size: 22px; margin: 4px 0;">72h</p>
          <p style="color: #888; font-size: 12px; margin: 0;">Tiempo medio respuesta</p>
        </div>
      </div>` : ''

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [userEmail],
      subject: content.subject,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 48px 20px 40px; text-align: center;">
            <div style="font-size: 44px; margin-bottom: 10px;">🏀</div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">La plataforma de baloncesto</p>
          </div>

          ${banner}

          <div style="padding: 40px 36px; background: white;">
            ${clubStats}
            ${content.body}

            <div style="text-align: center; margin: 32px 0 24px;">
              <a href="${content.ctaUrl}" style="background: #FF6B1A; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px;">
                ${content.ctaLabel} →
              </a>
            </div>

            <div style="background: #fafafa; border-radius: 10px; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 10px; color: #555; font-size: 14px; font-weight: 600;">Progreso de tu perfil — <span style="color: ${pColor};">20%</span></p>
              <div style="background: #e5e7eb; border-radius: 999px; height: 10px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${pColor}, ${pColor}99); height: 100%; width: 20%; border-radius: 999px;"></div>
              </div>
              <p style="margin: 10px 0 0; color: #aaa; font-size: 12px;">Complétalo al 100% para aparecer en las búsquedas de los clubes</p>
            </div>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, '[RESEND] Error sending welcome email')
      throw new Error('Failed to send welcome email: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[RESEND] Welcome email sent successfully')
    return data
  } catch (error) {
    logger.error({ err: error }, '[RESEND] Exception in sendWelcomeEmail')
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
    logger.info({ to: userEmail }, '[RESEND] Sending profile completed email')

    const roleNames = {
      jugador: 'Jugador',
      entrenador: 'Entrenador',
      club: 'Club/Agencia'
    }

    const roleName = roleNames[userRole as keyof typeof roleNames] || 'Usuario'
    const firstName = userName.split(' ')[0]

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [userEmail],
      subject: `¡Perfil completo! Ahora los clubes pueden encontrarte`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 48px 20px; text-align: center;">
            <div style="font-size: 56px; margin-bottom: 14px;">🏀</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">¡Perfil al 100%!</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
              Ahora los clubes pueden encontrarte
            </p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 12px 0; font-size: 24px; font-weight: 800;">Enhorabuena, ${firstName}</h2>
            <p style="color: #555; margin: 0 0 16px 0; font-size: 15px; line-height: 1.7;">
              Tu perfil de ${roleName} está completo al 100%. Eso significa que ya apareces en las búsquedas y cualquier club puede encontrarte en este momento.
            </p>
            <p style="color: #555; margin: 0 0 32px 0; font-size: 15px; line-height: 1.7;">
              <strong>Este es el primer paso real hacia tu próxima oportunidad.</strong>
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
              <h3 style="color: #16A34A; margin: 0 0 14px 0; font-size: 15px; font-weight: 700;">Qué puedes hacer ahora:</h3>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
                <li>Aparecer en búsquedas de ${userRole === 'club' ? 'talentos' : 'clubs y agencias'}</li>
                <li>Recibir notificaciones cuando alguien muestre interés en tu perfil</li>
                <li>Aplicar a oportunidades con tu perfil ya listo y visible</li>
                <li>Ser contactado directamente por clubes con Plan Pro</li>
              </ul>
            </div>

            <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px 24px; margin: 0 0 28px 0;">
              <h3 style="color: #111; margin: 0 0 12px 0; font-size: 14px; font-weight: 700;">Tips para maximizar tu visibilidad:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.9; font-size: 13px;">
                <li>Añade un vídeo de juego o entrenamiento si no lo has hecho</li>
                <li>Actualiza tus estadísticas de la temporada más reciente</li>
                <li>Aplica a oportunidades activamente — los clubes valoran la proactividad</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 36px 0;">
              <a href="${profileUrl}" style="background: #FF6B1A; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver mi perfil público
              </a>
            </div>

            ${userRole !== 'club' ? `
            <div style="background: #fff8f5; border-left: 4px solid #FF6B1A; padding: 20px 24px; border-radius: 4px;">
              <h3 style="color: #FF6B1A; margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">Consejo Pro</h3>
              <p style="color: #555; margin: 0 0 12px 0; line-height: 1.7; font-size: 14px;">
                Con el <strong>Plan Pro</strong> (4.99€/mes), tu perfil aparece destacado y los clubes pueden contactarte directamente. La mayoría de los fichajes en WorkHoops ocurren por contacto directo.
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${APP_URL}/planes" style="color: #FF6B1A; text-decoration: none; font-weight: bold; font-size: 14px;">
                  Ver Plan Pro →
                </a>
              </p>
            </div>
            ` : `
            <div style="background: #fff8f5; border-left: 4px solid #FF6B1A; padding: 20px 24px; border-radius: 4px;">
              <h3 style="color: #FF6B1A; margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">Siguiente paso</h3>
              <p style="color: #555; margin: 0 0 12px 0; line-height: 1.7; font-size: 14px;">
                Explora el directorio de jugadores y entrenadores. Con el <strong>Plan Pro</strong> puedes contactarlos directamente y construir tu equipo más rápido.
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${APP_URL}/talento/perfiles" style="color: #FF6B1A; text-decoration: none; font-weight: bold; font-size: 14px;">
                  Explorar talentos →
                </a>
              </p>
            </div>
            `}
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, '[RESEND] Error sending profile completed email')
      throw new Error('Failed to send profile completed email: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[RESEND] Profile completed email sent successfully')
    return data
  } catch (error) {
    logger.error({ err: error }, '[RESEND] Exception in sendProfileCompletedEmail')
    throw error
  }
}

export async function sendAdminWelcomeEmail(
  adminName: string,
  adminEmail: string
) {
  try {
    logger.info({ to: adminEmail }, '[RESEND] Sending admin welcome email')

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [adminEmail],
      subject: 'Acceso de Administrador activado - WorkHoops',
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 48px 20px; text-align: center;">
            <div style="font-size: 52px; margin-bottom: 14px;">🛡️</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Panel de Administración</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px;">Acceso administrativo activado</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 12px 0; font-size: 22px;">¡Bienvenido, ${escapeHtml(adminName)}!</h2>
            <p style="color: #555; margin: 0 0 28px 0; font-size: 15px; line-height: 1.7;">
              Se te ha otorgado acceso de <strong>Administrador</strong> en WorkHoops. Ahora tienes permisos especiales para gestionar la plataforma.
            </p>

            <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 24px; margin: 0 0 28px 0;">
              <h3 style="color: #4338ca; margin: 0 0 14px 0; font-size: 15px; font-weight: 700;">Capacidades de Administrador</h3>
              <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 2; font-size: 14px;">
                <li><strong>Usuarios:</strong> Ver, editar y administrar todos los usuarios</li>
                <li><strong>Oportunidades:</strong> Aprobar, editar o eliminar ofertas publicadas</li>
                <li><strong>Recursos:</strong> Crear y gestionar recursos de la plataforma</li>
                <li><strong>Aplicaciones:</strong> Ver todas las candidaturas y su estado</li>
                <li><strong>Analíticas:</strong> Estadísticas y métricas de la plataforma</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 36px 0;">
              <a href="${APP_URL}/admin" style="background: #4F46E5; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Acceder al Panel Admin
              </a>
            </div>

            <div style="background: #fef2f2; border-left: 4px solid #EF4444; padding: 18px 20px; border-radius: 4px; margin: 0 0 20px 0;">
              <h3 style="color: #DC2626; margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">Importante</h3>
              <p style="color: #666; margin: 0; line-height: 1.7; font-size: 14px;">
                Con grandes poderes vienen grandes responsabilidades. Usa tus permisos de administrador de manera responsable. Todas las acciones administrativas quedan registradas.
              </p>
            </div>

            <div style="background: #fafafa; padding: 18px 20px; border-radius: 8px; border: 1px solid #f0f0f0;">
              <h3 style="color: #111; margin: 0 0 12px 0; font-size: 14px; font-weight: 700;">Accesos rápidos</h3>
              <p style="margin: 0; font-size: 14px;">
                <a href="${APP_URL}/admin" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Panel Admin</a> ·
                <a href="${APP_URL}/admin/users" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Usuarios</a> ·
                <a href="${APP_URL}/admin/opportunities" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Oportunidades</a> ·
                <a href="${APP_URL}/admin/resources" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Recursos</a>
              </p>
            </div>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, '[RESEND] Error sending admin welcome email')
      throw new Error('Failed to send admin welcome email: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[RESEND] Admin welcome email sent successfully')
    return data
  } catch (error) {
    logger.error({ err: error }, '[RESEND] Exception in sendAdminWelcomeEmail')
    throw error
  }
}

export async function sendTalentInvitationEmail(
  talentEmail: string,
  talentName: string,
  clubName: string,
  inviteType: 'INVITE_TO_APPLY' | 'INVITE_TO_TRYOUT',
  message: string | null,
  profileUrl: string
) {
  if (!talentEmail) return null

  const inviteLabel = inviteType === 'INVITE_TO_APPLY' ? 'Invitación para aplicar' : 'Invitación a tryout'

  try {
    const safeTalentName = escapeHtml(talentName)
    const safeClubName = escapeHtml(clubName)
    const safeMessage = message ? escapeHtml(message) : null
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `${safeClubName} te ha invitado — ${inviteLabel}`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nueva invitación de scouting</p>
          </div>
          <div style="padding: 48px 36px; background: white;">
            <h2 style="color: #111; margin: 0 0 16px 0; font-size: 22px;">Hola, ${safeTalentName}</h2>
            <p style="color: #555; margin: 0 0 16px 0; line-height: 1.7; font-size: 15px;">
              <strong>${safeClubName}</strong> ha revisado tu perfil y te envía una <strong>${inviteLabel.toLowerCase()}</strong>. Un club tiene su mirada puesta en ti.
            </p>
            ${safeMessage ? `
              <div style="background: #fafafa; border-left: 4px solid #FF6B1A; padding: 18px 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #555; margin: 0; line-height: 1.7; white-space: pre-wrap; font-size: 14px;">${safeMessage}</p>
              </div>
            ` : ''}
            <div style="text-align: center; margin-top: 32px;">
              <a href="${profileUrl}" style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver mi perfil en WorkHoops
              </a>
            </div>
          </div>
          ${FOOTER_HTML}
        </div>
      `
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending talent invitation email')
    throw new Error('Failed to send talent invitation email')
  }
}

export async function sendClubLeadReceivedEmail(params: {
  clubEmail: string
  clubName: string
  playerName: string
  playerEmail: string
  playerPhone?: string | null
  message: string
  leadsUrl: string
}) {
  const { clubEmail, clubName, playerName, playerEmail, playerPhone, message, leadsUrl } = params

  if (!clubEmail) return null

  try {
    const safeClubName = escapeHtml(clubName)
    const safePlayerName = escapeHtml(playerName)
    const safePlayerEmail = escapeHtml(playerEmail)
    const safePlayerPhone = playerPhone ? escapeHtml(playerPhone) : null
    const safeMessage = escapeHtml(message)
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [clubEmail],
      subject: `${safePlayerName} quiere jugar en ${safeClubName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nuevo jugador interesado</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="margin: 0 0 8px 0; color: #111; font-size: 22px;">${safePlayerName} quiere jugar en tu club</h2>
            <p style="color: #888; margin: 0 0 28px 0; font-size: 14px;">Te ha enviado una solicitud desde la página pública del club</p>

            <div style="background: #fafafa; border-left: 4px solid #FF6B1A; padding: 18px 20px; border-radius: 4px; margin: 0 0 16px 0;">
              <p style="margin: 0 0 8px 0; color: #111; font-size: 14px; font-weight: 700;">Datos de contacto</p>
              <p style="margin: 0; color: #555; line-height: 1.6; font-size: 14px;">Email: <a href="mailto:${safePlayerEmail}" style="color: #FF6B1A;">${safePlayerEmail}</a></p>
              ${safePlayerPhone ? `<p style="margin: 6px 0 0 0; color: #555; font-size: 14px;">Teléfono: ${safePlayerPhone}</p>` : ''}
            </div>

            <div style="background: #fafafa; padding: 18px 20px; border-radius: 8px; margin: 0 0 28px 0; border: 1px solid #f0f0f0;">
              <p style="margin: 0 0 8px 0; color: #111; font-size: 14px; font-weight: 700;">Mensaje</p>
              <p style="margin: 0; color: #555; white-space: pre-wrap; line-height: 1.7; font-size: 14px;">${safeMessage}</p>
            </div>

            <div style="text-align: center;">
              <a href="${leadsUrl}" style="background: #FF6B1A; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ver jugadores interesados
              </a>
            </div>
          </div>
          ${FOOTER_HTML}
        </div>
      `
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending club lead email')
    throw new Error('Failed to send club lead email')
  }
}

export async function sendClubWeeklyRecruitingSummaryEmail(params: {
  clubEmail: string
  clubName: string
  newLeads: number
  pendingInvitations: number
  pendingShortlist: number
  dashboardUrl: string
}) {
  const { clubEmail, clubName, newLeads, pendingInvitations, pendingShortlist, dashboardUrl } = params

  if (!clubEmail) return null

  try {
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [clubEmail],
      subject: `Tu resumen semanal de reclutamiento, ${clubName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Resumen semanal</p>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <h2 style="margin: 0 0 8px 0; color: #111; font-size: 22px;">Hola, ${escapeHtml(clubName)}</h2>
            <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">Aquí tienes el estado actual de tu reclutamiento. No pierdas esta semana:</p>

            <div style="border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; margin-bottom: 12px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 14px;">📥</span>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Leads nuevos</p>
                <p style="margin: 0; color: #111; font-size: 22px; font-weight: bold;">${newLeads}</p>
              </div>
            </div>
            <div style="border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; margin-bottom: 12px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 14px;">📨</span>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Invitaciones pendientes</p>
                <p style="margin: 0; color: #111; font-size: 22px; font-weight: bold;">${pendingInvitations}</p>
              </div>
            </div>
            <div style="border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; margin-bottom: 28px; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 14px;">⭐</span>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Shortlist por trabajar</p>
                <p style="margin: 0; color: #111; font-size: 22px; font-weight: bold;">${pendingShortlist}</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${dashboardUrl}" style="background: #FF6B1A; color: white; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Abrir inbox de reclutamiento
              </a>
            </div>
          </div>
          ${FOOTER_HTML}
        </div>
      `
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending weekly recruiting summary')
    throw new Error('Failed to send weekly recruiting summary email')
  }
}

export async function sendClubRecruitingNudgeEmail(params: {
  clubEmail: string
  clubName: string
  staleLeads: number
  staleShortlist: number
  dashboardUrl: string
}) {
  const { clubEmail, clubName, staleLeads, staleShortlist, dashboardUrl } = params

  if (!clubEmail) return null

  try {
    const safeClubName = escapeHtml(clubName)
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [clubEmail],
      subject: `${safeClubName}, tienes talento pendiente por revisar`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Recordatorio de reclutamiento</p>
          </div>
          <div style="padding: 48px 36px; background: white;">
            <h2 style="margin: 0 0 12px 0; color: #111; font-size: 22px;">Hola, ${safeClubName}</h2>
            <p style="color: #555; margin: 0 0 24px 0; line-height: 1.7; font-size: 15px;">
              Hay actividad pendiente que puede convertirse en fichajes si actúas hoy.
            </p>
            <div style="border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; margin-bottom: 12px;">
              <p style="margin: 0; color: #111; font-size: 15px;"><strong>Leads sin revisar:</strong> <span style="color: #FF6B1A; font-size: 18px; font-weight: bold;">${staleLeads}</span></p>
            </div>
            <div style="border: 1px solid #f0f0f0; border-radius: 10px; padding: 20px; margin-bottom: 32px;">
              <p style="margin: 0; color: #111; font-size: 15px;"><strong>Talento guardado sin seguimiento:</strong> <span style="color: #FF6B1A; font-size: 18px; font-weight: bold;">${staleShortlist}</span></p>
            </div>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" style="background: #FF6B1A; color: white; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Abrir dashboard de club
              </a>
            </div>
          </div>
          <div style="padding: 18px 20px; background: #0f0f1a; text-align: center; border-top: 1px solid #1e1e2e;">
            <p style="margin: 0; color: #555; font-size: 13px; font-family: system-ui, -apple-system, Arial, sans-serif;">
              <strong style="color: #FF6B1A;">WorkHoops</strong> · La plataforma de baloncesto · <a href="https://workhoops.com" style="color: #FF6B1A; text-decoration: none;">workhoops.com</a><br/>
              <a href="${APP_URL}/dashboard/notifications" style="color: #555; text-decoration: underline; font-size: 12px; margin-top: 4px; display: inline-block;">Gestionar preferencias de email</a>
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending club recruiting nudge')
    throw new Error('Failed to send club recruiting nudge email')
  }
}

export async function sendIncompleteClubProfileEmail(
  userName: string,
  userEmail: string
) {
  try {
    const safeName = escapeHtml(userName)
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [userEmail],
      subject: 'Completa tu perfil en WorkHoops 🏀',
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 48px 20px; text-align: center;">
            <div style="font-size: 44px; margin-bottom: 10px;">🏀</div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">La plataforma de baloncesto</p>
          </div>

          <div style="background: linear-gradient(135deg, #FF6B1A, #e05a10); padding: 28px 36px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">¡Ya casi estás, ${safeName}!</h2>
          </div>

          <div style="padding: 48px 36px; background: white;">
            <p style="color: #555; margin: 0 0 24px 0; line-height: 1.7; font-size: 15px;">
              Te registraste en WorkHoops pero falta un último paso para que tu club sea visible para jugadores y entrenadores de toda España.
            </p>

            <div style="text-align: center; margin: 36px 0;">
              <a href="${APP_URL}/profile/complete"
                 style="background: #FF6B1A; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px;">
                Completar mi perfil →
              </a>
            </div>

            <p style="color: #aaa; font-size: 13px; margin: 0; text-align: center; line-height: 1.7;">
              Solo tarda 2 minutos. Una vez completado tu club aparecerá en la plataforma.
            </p>
          </div>

          ${FOOTER_HTML}
        </div>
      `,
    })

    if (error) {
      logger.error({ err: error }, '[RESEND] Error sending incomplete club profile email')
      throw new Error('Failed to send incomplete club profile email: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[RESEND] Incomplete club profile email sent successfully')
    return data
  } catch (error) {
    logger.error({ err: error }, '[RESEND] Exception in sendIncompleteClubProfileEmail')
    throw error
  }
}

export async function sendTalentInvitationReminderEmail(params: {
  talentEmail: string
  talentName: string
  pendingInvitations: number
  dashboardUrl: string
}) {
  const { talentEmail, talentName, pendingInvitations, dashboardUrl } = params

  if (!talentEmail) return null

  try {
    const safeTalentName = escapeHtml(talentName)
    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [talentEmail],
      subject: `Tienes ${pendingInvitations} invitación${pendingInvitations > 1 ? 'es' : ''} de clubes esperando`,
      html: `
        <div style="font-family: system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f1a; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
            <p style="color: #FF6B1A; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Invitaciones pendientes</p>
          </div>
          <div style="padding: 48px 36px; background: white;">
            <h2 style="margin: 0 0 12px 0; color: #111; font-size: 22px;">Hola, ${safeTalentName}</h2>
            <p style="color: #555; margin: 0 0 28px 0; line-height: 1.7; font-size: 15px;">
              Tienes <strong style="color: #FF6B1A; font-size: 18px;">${pendingInvitations}</strong> invitación${pendingInvitations > 1 ? 'es' : ''} de clubs pendiente${pendingInvitations > 1 ? 's' : ''} de revisar. No las dejes pasar.
            </p>
            <div style="text-align: center; margin-top: 16px;">
              <a href="${dashboardUrl}" style="background: #FF6B1A; color: white; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Revisar mis invitaciones
              </a>
            </div>
          </div>
          <div style="padding: 18px 20px; background: #0f0f1a; text-align: center; border-top: 1px solid #1e1e2e;">
            <p style="margin: 0; color: #555; font-size: 13px; font-family: system-ui, -apple-system, Arial, sans-serif;">
              <strong style="color: #FF6B1A;">WorkHoops</strong> · La plataforma de baloncesto · <a href="https://workhoops.com" style="color: #FF6B1A; text-decoration: none;">workhoops.com</a><br/>
              <a href="${APP_URL}/dashboard/notifications" style="color: #555; text-decoration: underline; font-size: 12px; margin-top: 4px; display: inline-block;">Gestionar preferencias de email</a>
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error({ err: error }, 'Error sending talent invitation reminder')
    throw new Error('Failed to send talent invitation reminder email')
  }
}
