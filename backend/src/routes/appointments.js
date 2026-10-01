import { Router } from "express";
import { Appointment } from "../models/Appointment.js";
import { cancelAppointmentService, createAppointmentService } from "../services/appointment.js";
import { ApiError, asyncHandler } from "../utils/errors.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const { doctorId, patientId, date, status } = req.query;
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) filter.date = date;
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("clinicId doctorId patientId")
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, appointments });
}));

router.post("/", asyncHandler(async (req, res) => {
  const appt = await createAppointmentService(req.body, req.user?._id);
  res.status(201).json({ success: true, appointment: appt });
}));

router.post("/:id/reschedule", asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const oldAppt = await Appointment.findById(req.params.id);
  if (!oldAppt) throw new ApiError(404, "Appointment not found");

  // Cancel old appointment (which triggers waitlist refill if needed)
  await cancelAppointmentService(req.params.id, "Rescheduled to new slot", req.user?._id);

  // Book new appointment
  const newAppt = await createAppointmentService({
    clinicId: oldAppt.clinicId,
    doctorId: oldAppt.doctorId,
    patientId: oldAppt.patientId,
    date,
    startTime,
    endTime,
    visitType: oldAppt.visitType,
    notes: `Rescheduled from ${oldAppt.date} ${oldAppt.startTime}`
  }, req.user?._id);

  res.json({ success: true, oldAppointment: oldAppt, newAppointment: newAppt });
}));

router.post("/:id/cancel", asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const appt = await cancelAppointmentService(req.params.id, reason, req.user?._id);
  res.json({ success: true, appointment: appt });
}));

export default router;
