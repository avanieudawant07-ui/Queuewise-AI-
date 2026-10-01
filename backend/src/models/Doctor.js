import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    slotDurationMinutes: { type: Number, default: 30 },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] }
    },
    autoApproveShortNotice: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
