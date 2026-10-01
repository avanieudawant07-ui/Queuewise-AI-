import { Router } from "express";
import { ApprovalRequest } from "../models/ApprovalRequest.js";
import { decideApproval } from "../services/approval.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

router.get("/pending", asyncHandler(async (req, res) => {
  const pending = await ApprovalRequest.find({ status: "pending" })
    .populate("slotDetails.doctorId candidateDetails.patientId")
    .sort({ createdAt: -1 });
  res.json({ success: true, approvals: pending });
}));

router.post("/:id/decide", asyncHandler(async (req, res) => {
  const { decision } = req.body; // "APPROVE" | "REJECT"
  const updated = await decideApproval(req.params.id, decision, req.user?._id);
  res.json({ success: true, approval: updated });
}));

export default router;
