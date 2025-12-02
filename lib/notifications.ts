import { prisma } from '@/lib/prisma'

interface CreateNotificationParams {
  userId: string
  type: 'application_received' | 'application_viewed' | 'application_accepted' | 'application_rejected' | 'message_received' | 'profile_saved'
  title: string
  message: string
  link?: string
}

/**
 * Crea una nueva notificación para un usuario
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
      },
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    // No lanzamos error para no romper el flujo principal
  }
}

/**
 * Notificación: Nueva aplicación recibida
 */
export async function notifyApplicationReceived(
  opportunityOwnerId: string,
  applicantName: string,
  opportunityTitle: string,
  applicationId: string
) {
  await createNotification({
    userId: opportunityOwnerId,
    type: 'application_received',
    title: 'Nueva aplicación recibida',
    message: `${applicantName} ha aplicado a tu oferta "${opportunityTitle}"`,
    link: `/dashboard/applications/${applicationId}`,
  })
}

/**
 * Notificación: Tu aplicación fue vista
 */
export async function notifyApplicationViewed(
  applicantId: string,
  opportunityTitle: string,
  applicationId: string
) {
  await createNotification({
    userId: applicantId,
    type: 'application_viewed',
    title: 'Tu aplicación fue vista',
    message: `El reclutador ha visto tu aplicación para "${opportunityTitle}"`,
    link: `/dashboard/my-applications/${applicationId}`,
  })
}

/**
 * Notificación: Aplicación aceptada
 */
export async function notifyApplicationAccepted(
  applicantId: string,
  opportunityTitle: string,
  applicationId: string
) {
  await createNotification({
    userId: applicantId,
    type: 'application_accepted',
    title: '¡Felicidades! Tu aplicación fue aceptada',
    message: `Tu aplicación para "${opportunityTitle}" ha sido aceptada. Revisa los próximos pasos.`,
    link: `/dashboard/my-applications/${applicationId}`,
  })
}

/**
 * Notificación: Aplicación rechazada
 */
export async function notifyApplicationRejected(
  applicantId: string,
  opportunityTitle: string,
  applicationId: string
) {
  await createNotification({
    userId: applicantId,
    type: 'application_rejected',
    title: 'Actualización de tu aplicación',
    message: `Tu aplicación para "${opportunityTitle}" no fue seleccionada en esta ocasión.`,
    link: `/dashboard/my-applications/${applicationId}`,
  })
}

/**
 * Notificación: Nuevo mensaje recibido
 */
export async function notifyMessageReceived(
  recipientId: string,
  senderName: string,
  messagePreview: string
) {
  await createNotification({
    userId: recipientId,
    type: 'message_received',
    title: 'Nuevo mensaje',
    message: `${senderName}: ${messagePreview}`,
    link: '/dashboard/messages',
  })
}

/**
 * Notificación: Alguien guardó tu perfil como favorito
 */
export async function notifyProfileSaved(
  profileOwnerId: string,
  saverName: string
) {
  await createNotification({
    userId: profileOwnerId,
    type: 'profile_saved',
    title: 'Tu perfil fue guardado',
    message: `${saverName} ha guardado tu perfil como favorito`,
    link: '/dashboard',
  })
}
