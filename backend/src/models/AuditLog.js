import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorType: { type: String, enum: ["USER", "AGENT", "SYSTEM"], default: "USER" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
