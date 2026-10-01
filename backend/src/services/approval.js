import { ApprovalRequest } from "../models/ApprovalRequest.js";
import { AgentRun } from "../models/AgentRun.js";
import { ApiError } from "../utils/errors.js";
import { eventBus } from "../events/eventBus.js";

export async function createApprovalRequest({ runId, agentType, actionRequired, reason, slotDetails, candidateDetails }) {
  const req = await ApprovalRequest.create({
    runId,
    agentType,
    actionRequired,
    reason,
    slotDetails,
    candidateDetails,
    status: "pending"
  });

  await AgentRun.findOneAndUpdate({ runId }, { status: "waiting_for_approval" });

  return req;
}

export async function decideApproval(requestId, decision, userId = null) {
  const req = await ApprovalRequest.findById(requestId);
  if (!req) throw new ApiError(404, "Approval request not found");
  if (req.status !== "pending") throw new ApiError(400, `Approval is already ${req.status}`);

  req.status = decision === "APPROVE" ? "approved" : "rejected";
  req.decidedBy = userId;
  req.decidedAt = new Date();
  await req.save();

  if (decision === "APPROVE") {
    eventBus.emit("APPROVAL_GRANTED", { runId: req.runId, requestId: req._id.toString() });
  } else {
    eventBus.emit("APPROVAL_REJECTED", { runId: req.runId, requestId: req._id.toString() });
  }

  return req;
}
