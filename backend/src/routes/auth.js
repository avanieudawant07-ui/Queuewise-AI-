import { Router } from "express";
import { User } from "../models/User.js";
import { loginUser, createAccountService, getUserById } from "../services/auth.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

// Create an Account (Phone Number based, No Password)
router.post("/register", asyncHandler(async (req, res) => {
  const { name, phone, role, specialty } = req.body;
  const result = await createAccountService({ name, phone, role, specialty });
  res.status(201).json({ success: true, ...result });
}));

// Access / Login (Phone Number based, No Password)
router.post("/login", asyncHandler(async (req, res) => {
  const { phone, identifier } = req.body;
  const phoneToUse = phone || identifier;
  const result = await loginUser(phoneToUse);
  res.json({ success: true, ...result });
}));

router.get("/me", authenticate, asyncHandler(async (req, res) => {
  const user = await getUserById(req.user._id);
  res.json({ success: true, user });
}));

export default router;
