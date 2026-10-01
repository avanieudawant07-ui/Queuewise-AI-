import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }, // optional if open to any doctor
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    joinedAt: { type: Date, default: Date.now },
    preferredDays: { type: [String], default: [] },
    preferredTimeRanges: { type: [String], default: ["Morning", "Afternoon"] },
    urgencyLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    status: {
      type: String,
      enum: ["active", "offered", "fulfilled", "cancelled", "expired"],
      default: "active"
    },
    priorityScore: { type: Number, default: 0 },
    declinedCount: { type: Number, default: 0 },
    currentOfferId: { type: String }
  },
  { timestamps: true }
);

export const Waitlist = mongoose.model("Waitlist", waitlistSchema);
