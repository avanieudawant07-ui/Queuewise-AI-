import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { Doctor } from "../models/Doctor.js";
import { Clinic } from "../models/Clinic.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, phone: user.phone },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export async function loginUser(phoneOrIdentifier) {
  if (!phoneOrIdentifier) {
    throw new ApiError(400, "Phone number is required");
  }

  const cleanPhone = phoneOrIdentifier.trim();
  const user = await User.findOne({ phone: cleanPhone });

  if (!user) {
    throw new ApiError(404, "No account found with this phone number. Please create an account first.");
  }

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;
  return { user: userObj, token };
}

export async function createAccountService({ name, phone, role = "PATIENT", specialty = "" }) {
  if (!name || !phone) {
    throw new ApiError(400, "Full Name and Phone Number are required");
  }

  const cleanPhone = phone.trim();

  // Check existing user by phone
  const existing = await User.findOne({ phone: cleanPhone });
  if (existing) {
    throw new ApiError(409, "An account with this phone number already exists");
  }

  const clinic = await Clinic.findOne() || await Clinic.create({
    name: "Metro Health Medical Center",
    phone: "9821001999"
  });

  let patientId = null;
  let doctorId = null;

  if (role === "PATIENT") {
    const patient = await Patient.create({
      name,
      phone: cleanPhone,
      preferredContactMethod: "SMS"
    });
    patientId = patient._id;
  } else if (role === "DOCTOR") {
    const doctor = await Doctor.create({
      clinicId: clinic._id,
      name,
      phone: cleanPhone,
      specialty: specialty || "General Physician",
      workingHours: { start: "09:00", end: "17:00", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    });
    doctorId = doctor._id;
  }

  const user = await User.create({
    name,
    phone: cleanPhone,
    password: "",
    role,
    clinicId: clinic._id,
    patientId,
    doctorId
  });

  const token = generateToken(user);
  const userObj = user.toObject();
  delete userObj.password;
  return { user: userObj, token };
}

export async function getUserById(userId) {
  const user = await User.findById(userId).populate("clinicId doctorId patientId");
  if (!user) throw new ApiError(404, "User not found");
  return user;
}
