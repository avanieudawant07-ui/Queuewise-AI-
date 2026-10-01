import { AgentRun } from "../../models/AgentRun.js";
import { AgentStep } from "../../models/AgentStep.js";
import { generateRunId, generateIdempotencyKey } from "../../utils/idGenerator.js";
import { logger } from "../../config/logger.js";

export class RunContext {
  constructor(runId, idempotencyKey, triggerEvent, clinicId = null, metadata = {}) {
    this.runId = runId;
    this.idempotencyKey = idempotencyKey;
    this.triggerEvent = triggerEvent;
    this.clinicId = clinicId;
    this.metadata = metadata;
    this.startTime = Date.now();
  }

  static async create(triggerEvent, idempotencyKey, clinicId = null, metadata = {}) {
    // Check if run already exists for this idempotency key
    const existing = await AgentRun.findOne({ idempotencyKey });
    if (existing) {
      logger.info(`Run for idempotencyKey ${idempotencyKey} already exists (${existing.runId}). Returning existing context.`);
      return new RunContext(existing.runId, existing.idempotencyKey, existing.triggerEvent, existing.clinicId, existing.metadata);
    }

    const runId = generateRunId();
    await AgentRun.create({
      runId,
      idempotencyKey,
      triggerEvent,
      clinicId,
      metadata,
      status: "running"
    });

    return new RunContext(runId, idempotencyKey, triggerEvent, clinicId, metadata);
  }

  async recordStep({ agentName, stepType, toolName = "", inputParams = {}, outputResult = {}, llmPrompt = "", llmResponse = "", reasoning = "", executionTimeMs = 0 }) {
    const step = await AgentStep.create({
      runId: this.runId,
      agentName,
      stepType,
      toolName,
      inputParams,
      outputResult,
      llmPrompt,
      llmResponse,
      reasoning,
      executionTimeMs,
      timestamp: new Date()
    });
    return step;
  }

  async updateStatus(status, errorMessage = "") {
    const update = { status };
    if (status === "completed" || status === "failed") {
      update.completedAt = new Date();
    }
    if (errorMessage) {
      update.errorMessage = errorMessage;
    }
    await AgentRun.findOneAndUpdate({ runId: this.runId }, update);
  }

  async setPlanSteps(steps) {
    await AgentRun.findOneAndUpdate({ runId: this.runId }, { planSteps: steps });
  }

  async updatePlanStepStatus(stepNumber, status) {
    await AgentRun.findOneAndUpdate(
      { runId: this.runId, "planSteps.stepNumber": stepNumber },
      { $set: { "planSteps.$.status": status } }
    );
  }
}
