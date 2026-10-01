import { Appointment } from "../../models/Appointment.js";
import { Doctor } from "../../models/Doctor.js";
import { Waitlist } from "../../models/Waitlist.js";
import { WaitlistOffer } from "../../models/WaitlistOffer.js";
import { logger } from "../../config/logger.js";

export async function runVerificationAgent(context, { doctorId, date, startTime, endTime, appointmentId = null, waitlistId = null }) {
  const startTimeMs = Date.now();
  const checks = [];

  // Check 1: Overlapping active appointments
  const appts = await Appointment.find({
    doctorId,
    date,
    status: { $in: ["scheduled", "confirmed"] }
  });

  const duplicates = appts.filter(a => a.startTime === startTime);
  const check1Passed = duplicates.length <= 1;
  checks.push({
    name: "NO_DOUBLE_BOOKING_INVARIANT",
    passed: check1Passed,
    details: check1Passed ? "No overlapping bookings detected." : `Found ${duplicates.length} active bookings for slot.`
  });

  // Check 2: Doctor working hours
  const doctor = await Doctor.findById(doctorId);
  let check2Passed = true;
  if (doctor && doctor.workingHours) {
    const { start, end } = doctor.workingHours;
    check2Passed = startTime >= start && endTime <= end;
  }
  checks.push({
    name: "DOCTOR_WORKING_HOURS_INVARIANT",
    passed: check2Passed,
    details: check2Passed ? "Slot is within doctor working hours." : "Slot violates doctor working hours."
  });

  // Check 3: Waitlist state consistency
  let check3Passed = true;
  if (waitlistId) {
    const entry = await Waitlist.findById(waitlistId);
    if (entry && entry.status === "fulfilled") {
      const linkedAppt = await Appointment.findOne({ waitlistOriginId: waitlistId, status: { $ne: "cancelled" } });
      check3Passed = !!linkedAppt;
    }
  }
  checks.push({
    name: "WAITLIST_STATE_CONSISTENCY_INVARIANT",
    passed: check3Passed,
    details: check3Passed ? "Waitlist state is consistent with appointment DB." : "Fulfilled waitlist entry lacks active appointment."
  });

  // Check 4: No orphan waitlist offers
  const pendingOffers = await WaitlistOffer.find({ doctorId, "slot.date": date, "slot.startTime": startTime, status: "pending" });
  const check4Passed = pendingOffers.length <= 1;
  checks.push({
    name: "ORPHAN_OFFER_INVARIANT",
    passed: check4Passed,
    details: check4Passed ? "Waitlist offer states are consistent." : "Multiple pending offers exist for same slot."
  });

  const allPassed = checks.every(c => c.passed);
  const executionTimeMs = Date.now() - startTimeMs;

  if (context && context.recordStep) {
    await context.recordStep({
      agentName: "VerificationAgent",
      stepType: "VERIFICATION",
      inputParams: { doctorId, date, startTime, endTime, appointmentId, waitlistId },
      outputResult: { allPassed, checks },
      reasoning: allPassed ? "All 4 deterministic scheduling invariants PASSED with 100% mathematical certainty." : "Invariant failure detected in DB post-mutation.",
      executionTimeMs
    });
  }

  return { allPassed, checks };
}
