import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientRole: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"], required: true },
    channel: { type: String, enum: ["SMS", "EMAIL", "IN_APP"], default: "IN_APP" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["SENT", "DELIVERED", "FAILED"], default: "SENT" },
    relatedEntityId: { type: String },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
