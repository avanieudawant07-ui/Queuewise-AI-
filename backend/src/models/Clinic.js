import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    timezone: { type: String, default: "America/New_York" },
    workingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "17:00" },
      days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    }
  },
  { timestamps: true }
);

export const Clinic = mongoose.model("Clinic", clinicSchema);
