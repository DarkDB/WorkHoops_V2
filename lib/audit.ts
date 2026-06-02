import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

interface CreateAuditLogParams {
  actorId: string
  action: string
  entity: string
  entityId: string
  metadata?: Record<string, unknown>
}

export async function createAuditLog({
  actorId,
  action,
  entity,
  entityId,
  metadata,
}: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    })
  } catch (error) {
    // Audit log failures should never break the main flow
    logger.error({ err: error }, 'Failed to create audit log')
  }
}
