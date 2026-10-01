import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, index: true },
    agentType: { type: String, required: true },
    actionRequired: { type: String, required: true },
    reason: { type: String, required: true },
    slotDetails: {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String }
    },
    candidateDetails: {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      patientName: { type: String },
      waitlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Waitlist" }
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date }
  },
  { timestamps: true }
);

export const ApprovalRequest = mongoose.model("ApprovalRequest", approvalRequestSchema);
