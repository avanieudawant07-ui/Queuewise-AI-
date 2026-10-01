import { Clinic } from "../models/Clinic.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { Waitlist } from "../models/Waitlist.js";
import { WaitlistOffer } from "../models/WaitlistOffer.js";
import { AgentRun } from "../models/AgentRun.js";
import { AgentStep } from "../models/AgentStep.js";
import { ApprovalRequest } from "../models/ApprovalRequest.js";
import { Notification } from "../models/Notification.js";
import { AuditLog } from "../models/AuditLog.js";
import { initialSeedData } from "./seedData.js";
import { logger } from "../config/logger.js";

export async function seedDatabase() {
  logger.info("Seeding database with realistic clinic data...");

  await Clinic.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await Waitlist.deleteMany({});
  await WaitlistOffer.deleteMany({});
  await AgentRun.deleteMany({});
  await AgentStep.deleteMany({});
  await ApprovalRequest.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});

  // 1. Create Clinic
  const clinic = await Clinic.create(initialSeedData.clinic);

  // 2. Create All 7 Specialized Doctors
  const doctors = await Promise.all(
    initialSeedData.doctors.map(d => Doctor.create({ ...d, clinicId: clinic._id }))
  );

  const doctor1 = doctors[0]; // Dr. Sarah Jenkins
  const doctor2 = doctors[1]; // Dr. Marcus Vance
  const doctor3 = doctors[2]; // Dr. Emily Chen (ENT)

  // 3. Create Patients
  const patients = await Patient.create(initialSeedData.patients.map(p => ({ ...p })));

  // 4. Create User Accounts (Phone Number-based, No Email, No Password)
  const userAccounts = [
    {
      name: "Admin Receptionist",
      phone: "9821001999",
      role: "ADMIN",
      clinicId: clinic._id
    },
    ...doctors.map(d => ({
      name: d.name,
      phone: d.phone,
      role: "DOCTOR",
      clinicId: clinic._id,
      doctorId: d._id
    })),
    ...patients.map(p => ({
      name: p.name,
      phone: p.phone,
      role: "PATIENT",
      clinicId: clinic._id,
      patientId: p._id
    }))
  ];

  await User.create(userAccounts);

  // Today's date string
  const today = new Date().toISOString().split("T")[0];

  // 5. Create Appointments for Dr. Sarah Jenkins & Dr. Emily Chen
  const appt1 = await Appointment.create({
    clinicId: clinic._id,
    doctorId: doctor1._id,
    patientId: patients[0]._id, // Alex Rivera
    date: today,
    startTime: "09:30",
    endTime: "10:00",
    status: "scheduled",
    visitType: "Annual Physical Exam",
    notes: "Patient requested morning slot"
  });

  const appt2 = await Appointment.create({
    clinicId: clinic._id,
    doctorId: doctor1._id,
    patientId: patients[1]._id, // Elena Rostova
    date: today,
    startTime: "11:00",
    endTime: "11:30",
    status: "scheduled",
    visitType: "Follow-up Consultation"
  });

  const appt3 = await Appointment.create({
    clinicId: clinic._id,
    doctorId: doctor3._id, // Dr. Emily Chen (ENT)
    patientId: patients[3]._id, // Sophia Martinez
    date: today,
    startTime: "14:00",
    endTime: "14:30",
    status: "scheduled",
    visitType: "Sinus & Allergy Checkup"
  });

  // 6. Create Waitlist Entries
  await Waitlist.create([
    {
      clinicId: clinic._id,
      doctorId: doctor1._id,
      patientId: patients[2]._id, // David Chen
      joinedAt: new Date(Date.now() - 3600 * 1000 * 5),
      preferredDays: ["Monday", "Tuesday", "Wednesday"],
      preferredTimeRanges: ["Morning", "Afternoon"],
      status: "active",
      priorityScore: 85
    },
    {
      clinicId: clinic._id,
      doctorId: doctor2._id,
      patientId: patients[3]._id, // Sophia Martinez
      joinedAt: new Date(Date.now() - 3600 * 1000 * 2),
      preferredDays: ["Friday"],
      preferredTimeRanges: ["Morning"],
      status: "active",
      priorityScore: 60
    }
  ]);

  logger.info("Database seeding complete with 7 specialized doctors and phone-only authentication!");
  return { clinic, doctors, patients, demoAppointmentId: appt1._id.toString() };
}
