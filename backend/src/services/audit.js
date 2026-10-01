import { AuditLog } from "../models/AuditLog.js";

export async function auditLog({ actorUserId = null, actorType = "USER", action, entityType, entityId, payload = {} }) {
  try {
    const log = await AuditLog.create({
      actorUserId,
      actorType,
      action,
      entityType,
      entityId: String(entityId),
      payload
    });
    return log;
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
