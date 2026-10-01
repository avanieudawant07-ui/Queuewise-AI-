import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const { recipientId } = req.query;
  const filter = recipientId ? { recipientId } : {};
  const notifications = await Notification.find(filter).sort({ sentAt: -1 }).limit(50);
  res.json({ success: true, notifications });
}));

export default router;
