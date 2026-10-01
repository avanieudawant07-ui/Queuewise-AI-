import mongoose from "mongoose";

const agentStepSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    stepType: { type: String, enum: ["THOUGHT", "TOOL_CALL", "OBSERVATION", "VERIFICATION", "APPROVAL", "SUMMARY"], required: true },
    toolName: { type: String, default: "" },
    inputParams: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputResult: { type: mongoose.Schema.Types.Mixed, default: {} },
    llmPrompt: { type: String, default: "" },
    llmResponse: { type: String, default: "" },
    reasoning: { type: String, default: "" },
    executionTimeMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const AgentStep = mongoose.model("AgentStep", agentStepSchema);
