import { Router } from "express";
import { Clinic } from "../models/Clinic.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { asyncHandler } from "../utils/errors.js";

const clinicRouter = Router();
clinicRouter.get("/", asyncHandler(async (req, res) => {
  const clinics = await Clinic.find();
  res.json({ success: true, clinics });
}));

const doctorRouter = Router();
doctorRouter.get("/", asyncHandler(async (req, res) => {
  const { clinicId } = req.query;
  const filter = clinicId ? { clinicId } : {};
  const doctors = await Doctor.find(filter).populate("clinicId");
  res.json({ success: true, doctors });
}));

doctorRouter.put("/:id/availability", asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { workingHours: req.body.workingHours }, { new: true });
  res.json({ success: true, doctor });
}));

const patientRouter = Router();
patientRouter.get("/", asyncHandler(async (req, res) => {
  const patients = await Patient.find();
  res.json({ success: true, patients });
}));

export { clinicRouter, doctorRouter, patientRouter };
