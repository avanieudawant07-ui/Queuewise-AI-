import { z } from "zod";
import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { registerTool } from "./registry.js";

export const getAppointmentTool = {
  name: "get_appointment",
  description: "Get detailed appointment info by ID",
  schema: z.object({
    appointmentId: z.string()
  }),
  execute: async ({ appointmentId }) => {
    const appt = await Appointment.findById(appointmentId).populate("clinicId doctorId patientId");
    return appt ? appt.toObject() : null;
  }
};
registerTool(getAppointmentTool);

export const getDoctorAvailabilityTool = {
  name: "get_doctor_availability",
  description: "Get doctor working hours and existing appointments for a date",
  schema: z.object({
    doctorId: z.string(),
    date: z.string()
  }),
  execute: async ({ doctorId, date }) => {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return null;

    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $in: ["scheduled", "confirmed"] }
    });

    return {
      doctorId,
      doctorName: doctor.name,
      workingHours: doctor.workingHours,
      slotDurationMinutes: doctor.slotDurationMinutes,
      bookedAppointments: appointments
    };
  }
};
registerTool(getDoctorAvailabilityTool);

export const checkScheduleConflictTool = {
  name: "check_schedule_conflict",
  description: "Check if doctor has any overlapping appointments for a given slot",
  schema: z.object({
    doctorId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string()
  }),
  execute: async ({ doctorId, date, startTime, endTime }) => {
    const conflict = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: { $in: ["scheduled", "confirmed"] }
    });
    return { hasConflict: !!conflict, conflictAppointment: conflict };
  }
};
registerTool(checkScheduleConflictTool);

export const createAppointmentTool = {
  name: "create_appointment",
  description: "Create a new appointment atomically with idempotency key",
  schema: z.object({
    clinicId: z.string(),
    doctorId: z.string(),
    patientId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    idempotencyKey: z.string().optional(),
    waitlistOriginId: z.string().optional(),
    notes: z.string().optional()
  }),
  execute: async (params) => {
    const appt = await Appointment.create({
      ...params,
      status: "scheduled"
    });
    return appt.toObject();
  }
};
registerTool(createAppointmentTool);

export const cancelAppointmentTool = {
  name: "cancel_appointment",
  description: "Cancel an existing appointment with reason",
  schema: z.object({
    appointmentId: z.string(),
    reason: z.string().default("Agent workflow")
  }),
  execute: async ({ appointmentId, reason }) => {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) return null;
    appt.status = "cancelled";
    appt.cancellationReason = reason;
    appt.cancelledAt = new Date();
    await appt.save();
    return appt.toObject();
  }
};
registerTool(cancelAppointmentTool);
