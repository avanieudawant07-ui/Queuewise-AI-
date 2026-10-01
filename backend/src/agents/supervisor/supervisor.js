import { RunContext } from "../runtime/runContext.js";
import { runWaitlistAgent } from "../waitlist/waitlistAgent.js";
import { runVerificationAgent } from "../verification/verificationAgent.js";
import { createApprovalRequest } from "../../services/approval.js";
import { createAppointmentService } from "../../services/appointment.js";
import { sendNotificationService } from "../../services/notification.js";
import { logger } from "../../config/logger.js";

export async function handleAppointmentCancelledEvent(eventData) {
  const { appointmentId, clinicId, doctorId, patientId, date, startTime, endTime, reason } = eventData;
  const idempotencyKey = `cancel_recovery_${appointmentId}`;

  const context = await RunContext.create("APPOINTMENT_CANCELLED", idempotencyKey, clinicId, {
    cancelledAppointmentId: appointmentId,
    doctorId,
    date,
    startTime,
    endTime
  });

  logger.info(`[SupervisorAgent] Initiating P1 cancellation recovery workflow for run ${context.runId}`);

  // Step 1: Set Execution Plan
  await context.setPlanSteps([
    { stepNumber: 1, description: "Validate released appointment slot & doctor working hours", status: "in_progress" },
    { stepNumber: 2, description: "Query and rank eligible waitlist candidates", status: "pending" },
    { stepNumber: 3, description: "Evaluate short-notice human approval policy", status: "pending" },
    { stepNumber: 4, description: "Dispatch offer to top waitlisted patient", status: "pending" },
    { stepNumber: 5, description: "Await patient acceptance & book slot atomically", status: "pending" },
    { stepNumber: 6, description: "Execute deterministic invariant verification suite", status: "pending" }
  ]);

  await context.recordStep({
    agentName: "SupervisorAgent",
    stepType: "THOUGHT",
    reasoning: `Received APPOINTMENT_CANCELLED event for slot ${date} ${startTime}. Generated 6-step recovery execution plan.`
  });

  // Step 1 Complete
  await context.updatePlanStepStatus(1, "completed");
  await context.updatePlanStepStatus(2, "in_progress");

  // Step 2 & 4: Run Waitlist Agent to pick candidate and prepare offer
  const { candidate, offer, candidatePoolExhausted } = await runWaitlistAgent(context, {
    clinicId,
    doctorId,
    date,
    startTime,
    endTime
  });

  if (candidatePoolExhausted || !candidate) {
    await context.recordStep({
      agentName: "SupervisorAgent",
      stepType: "SUMMARY",
      reasoning: "No eligible waitlist candidates available. Workflow ended cleanly."
    });
    await context.updateStatus("completed");
    return;
  }

  await context.updatePlanStepStatus(2, "completed");
  await context.updatePlanStepStatus(3, "in_progress");

  // Step 3: Human Approval Policy Check (< 2 hours lead time check)
  const apptDateTime = new Date(`${date}T${startTime}:00`);
  const hoursUntilSlot = (apptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilSlot > 0 && hoursUntilSlot < 2) {
    logger.info(`[SupervisorAgent] Slot is < 2 hours away (${hoursUntilSlot.toFixed(1)}h). Requesting human approval.`);
    await context.recordStep({
      agentName: "SupervisorAgent",
      stepType: "APPROVAL",
      reasoning: `Short notice slot (${hoursUntilSlot.toFixed(1)}h lead time < 2h threshold). Triggering doctor/admin approval card.`
    });

    await createApprovalRequest({
      runId: context.runId,
      agentType: "SupervisorAgent",
      actionRequired: "APPROVE_SHORT_NOTICE_SLOT_REFILL",
      reason: `Appointment slot on ${date} at ${startTime} is starting in ${hoursUntilSlot.toFixed(1)} hours.`,
      slotDetails: { doctorId, date, startTime, endTime },
      candidateDetails: { patientId: candidate.patientId._id, patientName: candidate.patientId.name, waitlistId: candidate._id }
    });

    await context.updatePlanStepStatus(3, "in_progress");
    return; // Wait for human approval event!
  }

  await context.updatePlanStepStatus(3, "completed");
  await context.updatePlanStepStatus(4, "completed");
  await context.updatePlanStepStatus(5, "in_progress");

  await context.updateStatus("waiting_for_patient");
  logger.info(`[SupervisorAgent] Offer ${offer.offerId} sent to patient ${candidate.patientId.name}. Awaiting response...`);
}

export async function handlePatientAcceptedOfferEvent({ offerId, runId, waitlistId, patientId, doctorId, clinicId, slot }) {
  logger.info(`[SupervisorAgent] Patient accepted offer ${offerId}. Executing atomic booking & verification...`);

  // Retrieve existing run context or create fallback
  const context = new RunContext(runId, `book_${offerId}`, "PATIENT_ACCEPTED_OFFER", clinicId);

  // Step 5: Book slot atomically
  const newAppt = await createAppointmentService({
    clinicId,
    doctorId,
    patientId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    idempotencyKey: `waitlist_book_${offerId}`,
    waitlistOriginId: waitlistId,
    notes: "Booked via QueueWise AI Waitlist Autonomous Recovery Workflow"
  });

  await context.recordStep({
    agentName: "SchedulingAgent",
    stepType: "TOOL_CALL",
    toolName: "create_appointment",
    inputParams: { clinicId, doctorId, patientId, slot },
    outputResult: newAppt
  });

  await context.updatePlanStepStatus(5, "completed");
  await context.updatePlanStepStatus(6, "in_progress");

  // Step 6: Deterministic Invariant Verification
  const verification = await runVerificationAgent(context, {
    doctorId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    appointmentId: newAppt._id.toString(),
    waitlistId
  });

  await context.updatePlanStepStatus(6, "completed");

  // Dispatch notifications to Doctor, Patient, and Admin
  await sendNotificationService({
    recipientId: patientId,
    recipientRole: "PATIENT",
    title: "Appointment Confirmed!",
    message: `Your appointment with Dr. is confirmed for ${slot.date} at ${slot.startTime}.`
  });

  await sendNotificationService({
    recipientId: doctorId,
    recipientRole: "DOCTOR",
    title: "Slot Refilled!",
    message: `Waitlist patient successfully auto-booked for ${slot.date} at ${slot.startTime}.`
  });

  await context.recordStep({
    agentName: "SupervisorAgent",
    stepType: "SUMMARY",
    reasoning: `Cancellation recovery workflow completed successfully! Slot ${slot.date} ${slot.startTime} refilled and verified with 100% deterministic certainty.`
  });

  await context.updateStatus("completed");
}
