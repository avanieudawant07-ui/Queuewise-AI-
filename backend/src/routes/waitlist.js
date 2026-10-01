import { Router } from "express";
import { Waitlist } from "../models/Waitlist.js";
import { WaitlistOffer } from "../models/WaitlistOffer.js";
import { respondToOfferService } from "../services/waitlist.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const entries = await Waitlist.find().populate("clinicId doctorId patientId").sort({ priorityScore: -1, joinedAt: 1 });
  res.json({ success: true, waitlist: entries });
}));

router.post("/", asyncHandler(async (req, res) => {
  const entry = await Waitlist.create(req.body);
  res.status(201).json({ success: true, waitlist: entry });
}));

router.get("/offers/pending", asyncHandler(async (req, res) => {
  const offers = await WaitlistOffer.find({ status: "pending" }).populate("waitlistId patientId doctorId clinicId");
  res.json({ success: true, offers });
}));

router.post("/offers/:offerId/respond", asyncHandler(async (req, res) => {
  const { response, runId } = req.body; // response: "ACCEPT" | "DECLINE"
  const result = await respondToOfferService(req.params.offerId, response, runId);
  res.json({ success: true, ...result });
}));

export default router;
