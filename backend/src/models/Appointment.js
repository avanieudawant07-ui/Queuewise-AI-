import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "cancelled", "completed", "no_show"],
      default: "scheduled"
    },
    cancellationReason: { type: String, default: "" },
    cancelledAt: { type: Date },
    idempotencyKey: { type: String, index: true },
    waitlistOriginId: { type: mongoose.Schema.Types.ObjectId, ref: "Waitlist" },
    visitType: { type: String, default: "General Consultation" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

// Prevent double bookings for active appointments
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["scheduled", "confirmed"] } }
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
