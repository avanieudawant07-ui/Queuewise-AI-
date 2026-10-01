import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectDB, disconnectDB } from "../config/db.js";
import { seedDatabase } from "../seed/seed.js";
import { cancelAppointmentService } from "../services/appointment.js";
import { respondToOfferService } from "../services/waitlist.js";
import { AgentRun } from "../models/AgentRun.js";
import { AgentStep } from "../models/AgentStep.js";
import { WaitlistOffer } from "../models/WaitlistOffer.js";
import { Appointment } from "../models/Appointment.js";

describe("QueueWise AI — Multi-Agent Cancellation Recovery (P1)", () => {
  let seedResult;

  beforeAll(async () => {
    await connectDB();
    seedResult = await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("should trigger autonomous recovery workflow when appointment is cancelled", async () => {
    const { demoAppointmentId } = seedResult;

    // 1. Cancel active appointment
    const cancelled = await cancelAppointmentService(demoAppointmentId, "Test cancellation");
    expect(cancelled.status).toBe("cancelled");

    // Allow event bus async handler to execute and reach waiting_for_patient state
    let run = null;
    for (let i = 0; i < 30; i++) {
      run = await AgentRun.findOne({ triggerEvent: "APPOINTMENT_CANCELLED" });
      if (run && (run.status === "waiting_for_patient" || run.status === "completed")) break;
      await new Promise(r => setTimeout(r, 500));
    }

    // 2. Check AgentRun was created
    expect(run).toBeDefined();
    expect(["waiting_for_patient", "completed"]).toContain(run.status);

    // 3. Check steps recorded
    const steps = await AgentStep.find({ runId: run.runId });
    expect(steps.length).toBeGreaterThan(0);

    // 4. Check Waitlist Offer sent
    const offer = await WaitlistOffer.findOne({ status: "pending" });
    expect(offer).toBeDefined();

    // 5. Patient accepts offer
    const result = await respondToOfferService(offer.offerId, "ACCEPT", run.runId);
    expect(result.accepted).toBe(true);

    // Allow async booking & verification to finish
    let completedRun = null;
    for (let i = 0; i < 30; i++) {
      completedRun = await AgentRun.findOne({ runId: run.runId });
      if (completedRun && completedRun.status === "completed") break;
      await new Promise(r => setTimeout(r, 500));
    }

    // 6. Verify new appointment booked atomically
    const refilledAppt = await Appointment.findOne({ waitlistOriginId: offer.waitlistId });
    expect(refilledAppt).toBeDefined();
    expect(refilledAppt.status).toBe("scheduled");

    // 7. Verify AgentRun reached COMPLETED state
    expect(completedRun.status).toBe("completed");
  }, 20000);
});
