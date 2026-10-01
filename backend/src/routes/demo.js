import { Router } from "express";
import { env } from "../config/env.js";
import { resetDemoData } from "../seed/resetDemo.js";
import { cancelAppointmentService } from "../services/appointment.js";
import { respondToOfferService } from "../services/waitlist.js";
import { WaitlistOffer } from "../models/WaitlistOffer.js";
import { Appointment } from "../models/Appointment.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

// Reset demo environment to clean initial state
router.post("/reset", asyncHandler(async (req, res) => {
  await resetDemoData();
  res.json({ success: true, message: "Demo data reset successfully." });
}));

// Toggle FORCE_LLM_FAILURE mode
router.post("/toggle-llm-failure", asyncHandler(async (req, res) => {
  env.FORCE_LLM_FAILURE = !env.FORCE_LLM_FAILURE;
  res.json({
    success: true,
    forceLLMFailure: env.FORCE_LLM_FAILURE,
    message: `FORCE_LLM_FAILURE is now ${env.FORCE_LLM_FAILURE ? "ACTIVE (Deterministic Fallback Mode)" : "INACTIVE (LLM Gemini Mode)"}`
  });
}));

// Trigger test cancellation for Act 3 live demo
router.post("/trigger-cancel", asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  let targetAppt;
  if (appointmentId) {
    targetAppt = await Appointment.findById(appointmentId);
  } else {
    targetAppt = await Appointment.findOne({ status: "scheduled" });
  }

  if (!targetAppt) {
    return res.status(404).json({ success: false, error: "No active appointment found to cancel for demo." });
  }

  const cancelled = await cancelAppointmentService(targetAppt._id, "Demo Act 3 cancellation trigger");
  res.json({ success: true, appointment: cancelled });
}));

// Simulate patient acceptance/decline for Act 3
router.post("/simulate-patient-response", asyncHandler(async (req, res) => {
  const { response = "ACCEPT", offerId } = req.body;
  let offer;
  if (offerId) {
    offer = await WaitlistOffer.findOne({ offerId });
  } else {
    offer = await WaitlistOffer.findOne({ status: "pending" });
  }

  if (!offer) {
    return res.status(404).json({ success: false, error: "No pending waitlist offer found to respond to." });
  }

  const result = await respondToOfferService(offer.offerId, response);
  res.json({ success: true, ...result });
}));

export default router;
