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
  // Production has no audit_logs table. Preserve call sites until a dedicated
  // ledger migration is introduced, without issuing a query against a missing table.
  void actorId
  void action
  void entity
  void entityId
  void metadata
}
