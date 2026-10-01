import { z } from "zod";
import { sendNotificationService } from "../services/notification.js";
import { createApprovalRequest } from "../services/approval.js";
import { registerTool } from "./registry.js";

export const sendNotificationTool = {
  name: "send_notification",
  description: "Send notification to patient, doctor, or admin",
  schema: z.object({
    recipientId: z.string(),
    recipientRole: z.enum(["PATIENT", "DOCTOR", "ADMIN"]),
    channel: z.enum(["SMS", "EMAIL", "IN_APP"]).default("IN_APP"),
    title: z.string(),
    message: z.string(),
    relatedEntityId: z.string().optional()
  }),
  execute: async (params) => {
    const notif = await sendNotificationService(params);
    return notif.toObject();
  }
};
registerTool(sendNotificationTool);

export const requestApprovalTool = {
  name: "request_approval",
  description: "Request doctor or admin approval for short-notice or exception actions",
  schema: z.object({
    runId: z.string(),
    agentType: z.string(),
    actionRequired: z.string(),
    reason: z.string(),
    slotDetails: z.any().optional(),
    candidateDetails: z.any().optional()
  }),
  execute: async (params) => {
    const req = await createApprovalRequest(params);
    return req.toObject();
  }
};
registerTool(requestApprovalTool);
