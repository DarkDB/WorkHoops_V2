/**
 * WorkHoops Onboarding Email Sequences
 *
 * Sequence overview (7 days total, 3 emails):
 *   Email 1 — Welcome           (day 0, immediate) — handled in lib/email.ts → sendWelcomeEmail
 *   Email 2 — Quick Win         (day 1) — profile completion tip + first action prompt
 *   Email 3 — Social Proof      (day 3) — success story + upgrade nudge
 *
 * All functions accept { email, name, role } and delegate sending to the Resend
 * client already configured in lib/email.ts (getResendClient).
 *
 * Integration:
 *   - Trigger Email 2 via POST /api/email/onboarding { userId, emailNumber: 2 }
 *   - Trigger Email 3 via POST /api/email/onboarding { userId, emailNumber: 3 }
 *   - Or schedule with a cron job reading users created 1/3 days ago.
 */

import { getResendClient } from '@/lib/email'
import logger from '@/lib/logger'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingUser {
  email: string
  name: string
  role: 'jugador' | 'entrenador' | 'club' | 'agencia' | string
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const APP_URL = process.env.APP_URL || 'https://workhoops.es'

function emailWrapper(body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #FF6B1A 0%, #cc5214 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">WorkHoops</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Tu plataforma de oportunidades de baloncesto</p>
      </div>

      <!-- Body -->
      <div style="background: #ffffff; padding: 40px 30px;">
        ${body}
      </div>

      <!-- Footer -->
      <div style="background: #0f0f1a; padding: 24px 30px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0 0 10px 0;">
          WorkHoops · Tu carrera en el baloncesto empieza aquí
        </p>
        <p style="margin: 0;">
          <a href="${APP_URL}/oportunidades" style="color: #FF6B1A; text-decoration: none; font-size: 13px; margin: 0 8px;">Oportunidades</a>
          <a href="${APP_URL}/planes" style="color: #FF6B1A; text-decoration: none; font-size: 13px; margin: 0 8px;">Planes</a>
          <a href="${APP_URL}/dashboard/notifications" style="color: rgba(255,255,255,0.35); text-decoration: none; font-size: 12px; margin: 0 8px;">Gestionar emails</a>
        </p>
      </div>
    </div>
  `
}

function ctaButton(text: string, href: string): string {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${href}"
         style="background: #FF6B1A; color: #ffffff; padding: 14px 32px; text-decoration: none;
                border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;
                letter-spacing: 0.2px;">
        ${text}
      </a>
    </div>
  `
}

// ─── Role copy maps ───────────────────────────────────────────────────────────

type RoleKey = 'jugador' | 'entrenador' | 'club'

function resolveRole(role: string): RoleKey {
  if (role === 'agencia') return 'club'
  if (['jugador', 'entrenador', 'club'].includes(role)) return role as RoleKey
  return 'jugador'
}

// ─── Email 2: Quick Win (send ~24 h after registration) ───────────────────────

/**
 * Onboarding Email 2 — Quick Win
 * Goal: get the user to complete their profile (the single most impactful
 *       activation step that unlocks visibility and applications).
 * Send: Day 1 after registration
 */
export async function sendOnboardingEmail2(user: OnboardingUser) {
  const { email, name, role } = user
  const r = resolveRole(role)

  const roleContent: Record<RoleKey, { headline: string; tip: string; cta: string; ctaUrl: string }> = {
    jugador: {
      headline: 'Tu perfil incompleto te está costando oportunidades',
      tip: `Los jugadores con perfil al 100% reciben <strong>3× más invitaciones</strong> de clubes y agencias.
            Añade tus estadísticas, posición y un vídeo de highlights para destacar en las búsquedas.`,
      cta: 'Completar mi perfil ahora',
      ctaUrl: `${APP_URL}/profile/complete`,
    },
    entrenador: {
      headline: 'Un perfil completo habla por ti antes de la primera entrevista',
      tip: `Los entrenadores con perfil detallado —filosofía, historial de equipos y metodología—
            tienen <strong>más del doble de probabilidades</strong> de ser contactados por clubes.`,
      cta: 'Completar mi perfil de entrenador',
      ctaUrl: `${APP_URL}/profile/complete`,
    },
    club: {
      headline: 'Publica tu primera oportunidad en menos de 5 minutos',
      tip: `Los clubs que publican su primera oportunidad en las primeras 48 horas reciben
            candidaturas <strong>más rápido y de mayor calidad</strong>. Empieza hoy.`,
      cta: 'Publicar primera oportunidad',
      ctaUrl: `${APP_URL}/dashboard/opportunities/new`,
    },
  }

  const c = roleContent[r]

  const body = `
    <h2 style="color: #0f0f1a; font-size: 22px; margin: 0 0 8px 0;">Hola ${name} 👋</h2>

    <p style="color: #444; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
      Bienvenido de nuevo. Notamos que todavía no has terminado de configurar tu perfil.
      Aquí va el consejo más importante que podemos darte:
    </p>

    <div style="background: #0f0f1a; border-left: 4px solid #FF6B1A; padding: 20px 24px;
                border-radius: 0 8px 8px 0; margin: 0 0 28px 0;">
      <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
        ${c.headline}
      </p>
      <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin: 0;">
        ${c.tip}
      </p>
    </div>

    <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 8px 0;">
      Solo te llevará <strong>5–10 minutos</strong>. Hazlo ahora y empieza a aparecer en las búsquedas hoy mismo.
    </p>

    ${ctaButton(c.cta, c.ctaUrl)}

    <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      Si tienes alguna duda, responde este email y te ayudamos encantados.
    </p>
  `

  try {
    logger.info({ to: email }, '[SEQUENCE] Sending onboarding email 2 (quick-win)')

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [email],
      subject: 'Tu perfil está incompleto — esto te está costando oportunidades',
      html: emailWrapper(body),
    })

    if (error) {
      logger.error({ err: error }, '[SEQUENCE] Error sending onboarding email 2')
      throw new Error('Failed to send onboarding email 2: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[SEQUENCE] Onboarding email 2 sent')
    return data
  } catch (err) {
    logger.error({ err }, '[SEQUENCE] Exception in sendOnboardingEmail2')
    throw err
  }
}

// ─── Email 3: Social Proof + Upgrade Nudge (send ~72 h after registration) ───

/**
 * Onboarding Email 3 — Social Proof & Upgrade
 * Goal: build trust with a real success story and introduce the Pro plan
 *       as the next natural step for serious users.
 * Send: Day 3 after registration
 */
export async function sendOnboardingEmail3(user: OnboardingUser) {
  const { email, name, role } = user
  const r = resolveRole(role)

  const stories: Record<RoleKey, { quote: string; author: string; outcome: string }> = {
    jugador: {
      quote:
        '"Llevaba meses buscando equipo por mi cuenta. En WorkHoops subí mi perfil un martes y el jueves ya tenía una llamada de un club de LEB Plata."',
      author: 'Carlos M., escolta, 24 años',
      outcome: 'Fichó con un club de liga nacional en 2 semanas.',
    },
    entrenador: {
      quote:
        '"Tenía experiencia pero no sabía cómo llegar a los clubs correctos. WorkHoops me dio visibilidad donde realmente importa."',
      author: 'Marta L., entrenadora ayudante, 31 años',
      outcome: 'Incorporada como primer entrenadora en un club EBA.',
    },
    club: {
      quote:
        '"Publicamos una oportunidad para base y en 48 horas teníamos 12 candidaturas cualificadas. Nunca había sido tan rápido."',
      author: 'Director deportivo, club LEB Bronce',
      outcome: 'Fichaje cerrado en menos de 10 días.',
    },
  }

  const upgradeCopy: Record<RoleKey, { headline: string; benefits: string[]; ctaText: string }> = {
    jugador: {
      headline: '¿Quieres que los clubes te encuentren a ti?',
      benefits: [
        'Perfil destacado en búsquedas de reclutadores',
        'Acceso a todas las oportunidades Premium',
        'Contacto directo de clubes y agencias',
        'Estadísticas detalladas de visitas a tu perfil',
      ],
      ctaText: 'Activar Plan Pro — 4,99 €/mes',
    },
    entrenador: {
      headline: '¿Listo para dar el siguiente paso?',
      benefits: [
        'Perfil visible para todos los clubs y academias',
        'Notificaciones de oportunidades antes que el resto',
        'Contacto directo de organizaciones',
        'Acceso a posiciones Premium no publicadas',
      ],
      ctaText: 'Activar Plan Pro — 4,99 €/mes',
    },
    club: {
      headline: 'Lleva tu reclutamiento al siguiente nivel',
      benefits: [
        'Contacto directo con cualquier jugador o entrenador',
        'Búsqueda avanzada con filtros por posición, nivel y ubicación',
        'Invitaciones ilimitadas a perfiles seleccionados',
        'Analíticas de tus publicaciones',
      ],
      ctaText: 'Ver Plan Club — desde 29 €/mes',
    },
  }

  const story = stories[r]
  const upgrade = upgradeCopy[r]

  const body = `
    <h2 style="color: #0f0f1a; font-size: 22px; margin: 0 0 20px 0;">
      Hola ${name}, ¿sabes qué están logrando otros usuarios?
    </h2>

    <!-- Success story -->
    <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; margin: 0 0 28px 0;">
      <p style="color: #0f0f1a; font-size: 17px; font-style: italic; line-height: 1.7; margin: 0 0 16px 0;">
        ${story.quote}
      </p>
      <p style="color: #888; font-size: 13px; margin: 0 0 8px 0;">— ${story.author}</p>
      <p style="background: #FF6B1A; color: #ffffff; display: inline-block; padding: 4px 12px;
                border-radius: 20px; font-size: 13px; font-weight: bold; margin: 0;">
        ${story.outcome}
      </p>
    </div>

    <!-- Upgrade block -->
    <div style="background: #0f0f1a; border-radius: 8px; padding: 28px; margin: 0 0 28px 0;">
      <h3 style="color: #FF6B1A; font-size: 18px; margin: 0 0 16px 0;">
        ${upgrade.headline}
      </h3>
      <ul style="color: rgba(255,255,255,0.8); padding-left: 20px; margin: 0 0 20px 0; line-height: 2;">
        ${upgrade.benefits.map(b => `<li>${b}</li>`).join('')}
      </ul>
      ${ctaButton(upgrade.ctaText, `${APP_URL}/planes`)}
    </div>

    <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 8px 0;">
      Si prefieres quedarte en el plan gratuito, está bien también. Sigue explorando
      <a href="${APP_URL}/oportunidades" style="color: #FF6B1A; text-decoration: none;">las oportunidades disponibles</a>
      y aplica cuando encuentres la adecuada.
    </p>

    <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      Cualquier pregunta, responde este email. Estamos aquí.
    </p>
  `

  try {
    logger.info({ to: email }, '[SEQUENCE] Sending onboarding email 3 (social proof)')

    const { data, error } = await getResendClient().emails.send({
      from: 'WorkHoops <hola@workhoops.com>',
      to: [email],
      subject: `${name}, esto es lo que consiguen otros en WorkHoops`,
      html: emailWrapper(body),
    })

    if (error) {
      logger.error({ err: error }, '[SEQUENCE] Error sending onboarding email 3')
      throw new Error('Failed to send onboarding email 3: ' + JSON.stringify(error))
    }

    logger.info({ id: data?.id }, '[SEQUENCE] Onboarding email 3 sent')
    return data
  } catch (err) {
    logger.error({ err }, '[SEQUENCE] Exception in sendOnboardingEmail3')
    throw err
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Central dispatcher for the onboarding sequence.
 * emailNumber 1 → sendWelcomeEmail (already called from register route)
 * emailNumber 2 → sendOnboardingEmail2
 * emailNumber 3 → sendOnboardingEmail3
 */
export async function sendOnboardingEmail(
  emailNumber: number,
  user: OnboardingUser & { id?: string }
) {
  switch (emailNumber) {
    case 1: {
      // Email 1 is handled by the register route — redirect to the existing function
      const { sendWelcomeEmail } = await import('@/lib/email')
      return sendWelcomeEmail(user.name, user.email, user.role)
    }
    case 2:
      return sendOnboardingEmail2(user)
    case 3:
      return sendOnboardingEmail3(user)
    default:
      throw new Error(`Unknown onboarding email number: ${emailNumber}`)
  }
}
