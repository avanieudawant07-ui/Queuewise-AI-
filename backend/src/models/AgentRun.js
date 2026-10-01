import mongoose from "mongoose";

const agentRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true, index: true },
    triggerEvent: { type: String, required: true },
    status: {
      type: String,
      enum: ["running", "waiting_for_approval", "waiting_for_patient", "completed", "failed"],
      default: "running"
    },
    idempotencyKey: { type: String, unique: true, index: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    planSteps: [
      {
        stepNumber: { type: Number },
        description: { type: String },
        status: { type: String, enum: ["pending", "in_progress", "completed", "failed"], default: "pending" }
      }
    ],
    errorMessage: { type: String, default: "" },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const AgentRun = mongoose.model("AgentRun", agentRunSchema);
