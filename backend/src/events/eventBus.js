import { EventEmitter } from "events";
import { logger } from "../config/logger.js";
import { handleAppointmentCancelledEvent, handlePatientAcceptedOfferEvent } from "../agents/supervisor/supervisor.js";

class QueueWiseEventBus extends EventEmitter {}

export const eventBus = new QueueWiseEventBus();

// Attach domain event listeners
eventBus.on("APPOINTMENT_CANCELLED", async (data) => {
  logger.info(`[EventBus] APPOINTMENT_CANCELLED event received for appointment ${data.appointmentId}`);
  try {
    await handleAppointmentCancelledEvent(data);
  } catch (err) {
    logger.error(`[EventBus] Error handling APPOINTMENT_CANCELLED event: ${err.message}`, err);
  }
});

eventBus.on("PATIENT_ACCEPTED_OFFER", async (data) => {
  logger.info(`[EventBus] PATIENT_ACCEPTED_OFFER event received for offer ${data.offerId}`);
  try {
    await handlePatientAcceptedOfferEvent(data);
  } catch (err) {
    logger.error(`[EventBus] Error handling PATIENT_ACCEPTED_OFFER event: ${err.message}`, err);
  }
});

eventBus.on("APPROVAL_GRANTED", async (data) => {
  logger.info(`[EventBus] APPROVAL_GRANTED for run ${data.runId}`);
});
