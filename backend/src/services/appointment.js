import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { ApiError } from "../utils/errors.js";
import { eventBus } from "../events/eventBus.js";
import { auditLog } from "./audit.js";

export async function createAppointmentService(data, actorId = null) {
  // Check doctor availability & existing overlaps
  const conflict = await Appointment.findOne({
    doctorId: data.doctorId,
    date: data.date,
    startTime: data.startTime,
    status: { $in: ["scheduled", "confirmed"] }
  });

  if (conflict) {
    throw new ApiError(409, `Slot ${data.date} ${data.startTime} is already booked.`);
  }

  const appt = await Appointment.create(data);
  await auditLog({
    actorUserId: actorId,
    actorType: actorId ? "USER" : "AGENT",
    action: "CREATE_APPOINTMENT",
    entityType: "Appointment",
    entityId: appt._id,
    payload: data
  });

  return appt;
}

export async function cancelAppointmentService(appointmentId, reason = "Patient request", actorId = null) {
  const appt = await Appointment.findById(appointmentId).populate("clinicId doctorId patientId");
  if (!appt) throw new ApiError(404, "Appointment not found");

  if (appt.status === "cancelled") {
    return appt; // idempotent
  }

  appt.status = "cancelled";
  appt.cancellationReason = reason;
  appt.cancelledAt = new Date();
  await appt.save();

  await auditLog({
    actorUserId: actorId,
    actorType: actorId ? "USER" : "SYSTEM",
    action: "CANCEL_APPOINTMENT",
    entityType: "Appointment",
    entityId: appt._id,
    payload: { reason }
  });

  // Trigger P1 cancellation recovery event on event bus!
  eventBus.emit("APPOINTMENT_CANCELLED", {
    appointmentId: appt._id.toString(),
    clinicId: appt.clinicId._id.toString(),
    doctorId: appt.doctorId._id.toString(),
    patientId: appt.patientId._id.toString(),
    date: appt.date,
    startTime: appt.startTime,
    endTime: appt.endTime,
    reason
  });

  return appt;
}
