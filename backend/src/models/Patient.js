import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    preferredContactMethod: { type: String, enum: ["SMS", "EMAIL", "BOTH"], default: "SMS" },
    timePreferences: {
      days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
      timeOfDay: { type: [String], default: ["Morning", "Afternoon"] },
      preferredDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
    }
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
