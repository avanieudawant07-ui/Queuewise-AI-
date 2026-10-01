import { Waitlist } from "../models/Waitlist.js";
import { WaitlistOffer } from "../models/WaitlistOffer.js";
import { generateOfferId } from "../utils/idGenerator.js";
import { ApiError } from "../utils/errors.js";
import { eventBus } from "../events/eventBus.js";

export async function getEligibleCandidates({ clinicId, doctorId, date, startTime, endTime }) {
  const candidates = await Waitlist.find({
    clinicId,
    status: "active",
    $or: [{ doctorId: null }, { doctorId }]
  }).populate("patientId");

  // Rank candidates based on FIFO and preferences fit
  const ranked = candidates.map(c => {
    let score = 100;
    // FIFO penalty per hour elapsed
    const hoursWaiting = (Date.now() - new Date(c.joinedAt).getTime()) / (1000 * 60 * 60);
    score += hoursWaiting * 2;
    // Penalty for past declined offers
    score -= (c.declinedCount || 0) * 15;
    return { candidate: c, score };
  }).sort((a, b) => b.score - a.score);

  return ranked.map(r => r.candidate);
}

export async function createOfferService({ waitlistId, slot, message, ttlMinutes = 60 }) {
  const entry = await Waitlist.findById(waitlistId);
  if (!entry) throw new ApiError(404, "Waitlist entry not found");

  const offerId = generateOfferId();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const offer = await WaitlistOffer.create({
    offerId,
    waitlistId: entry._id,
    patientId: entry.patientId,
    doctorId: slot.doctorId,
    clinicId: entry.clinicId,
    slot,
    message,
    status: "pending",
    expiresAt
  });

  entry.status = "offered";
  entry.currentOfferId = offerId;
  await entry.save();

  return offer;
}

export async function respondToOfferService(offerId, response, runId = null) {
  const offer = await WaitlistOffer.findOne({ offerId }).populate("patientId doctorId clinicId");
  if (!offer) throw new ApiError(404, "Offer not found");
  if (offer.status !== "pending") {
    throw new ApiError(400, `Offer is already ${offer.status}`);
  }

  const waitlist = await Waitlist.findById(offer.waitlistId);

  if (response === "ACCEPT") {
    offer.status = "accepted";
    offer.respondedAt = new Date();
    await offer.save();

    if (waitlist) {
      waitlist.status = "fulfilled";
      await waitlist.save();
    }

    eventBus.emit("PATIENT_ACCEPTED_OFFER", {
      offerId,
      runId,
      waitlistId: offer.waitlistId.toString(),
      patientId: offer.patientId._id.toString(),
      doctorId: offer.doctorId._id.toString(),
      clinicId: offer.clinicId._id.toString(),
      slot: offer.slot
    });

    return { offer, accepted: true };
  } else {
    offer.status = "declined";
    offer.respondedAt = new Date();
    await offer.save();

    if (waitlist) {
      waitlist.status = "active";
      waitlist.declinedCount = (waitlist.declinedCount || 0) + 1;
      waitlist.currentOfferId = null;
      await waitlist.save();
    }

    eventBus.emit("PATIENT_DECLINED_OFFER", {
      offerId,
      runId,
      waitlistId: offer.waitlistId.toString()
    });

    return { offer, accepted: false };
  }
}
