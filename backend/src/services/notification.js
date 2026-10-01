import { Notification } from "../models/Notification.js";

export async function sendNotificationService({ recipientId, recipientRole, channel = "IN_APP", title, message, relatedEntityId = "" }) {
  const notif = await Notification.create({
    recipientId,
    recipientRole,
    channel,
    title,
    message,
    relatedEntityId,
    status: "SENT"
  });
  return notif;
}
