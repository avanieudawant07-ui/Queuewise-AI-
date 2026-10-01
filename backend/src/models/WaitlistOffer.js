import mongoose from "mongoose";

const waitlistOfferSchema = new mongoose.Schema(
  {
    offerId: { type: String, required: true, unique: true },
    waitlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Waitlist", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    slot: {
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending"
    },
    sentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    respondedAt: { type: Date }
  },
  { timestamps: true }
);

export const WaitlistOffer = mongoose.model("WaitlistOffer", waitlistOfferSchema);
