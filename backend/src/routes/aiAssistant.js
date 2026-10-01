import { Router } from "express";
import { generateJSON } from "../agents/llm/llmClient.js";
import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { Waitlist } from "../models/Waitlist.js";
import { createAppointmentService, cancelAppointmentService } from "../services/appointment.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

// Pre-filtering guardrail for medical emergency or diagnosis queries
function checkMedicalSafetyGuard(message) {
  const medicalKeywords = ["symptom", "pain", "chest pain", "bleeding", "fever", "stroke", "heart attack", "diagnosis", "medication dose", "emergency"];
  const lower = message.toLowerCase();
  for (const kw of medicalKeywords) {
    if (lower.includes(kw)) {
      return "I am QueueWise Administrative AI Assistant. I cannot answer clinical questions or medical emergencies. If this is a medical emergency, please call 911 or visit the nearest emergency room immediately. For booking or scheduling, how can I assist you?";
    }
  }
  return null;
}

router.post("/chat", asyncHandler(async (req, res) => {
  const { message, userId, role = "PATIENT" } = req.body;

  // 1. Check safety guardrail
  const safetyRefusal = checkMedicalSafetyGuard(message);
  if (safetyRefusal) {
    return res.json({
      success: true,
      reply: safetyRefusal,
      actionTaken: "MEDICAL_REFUSAL"
    });
  }

  // 2. Process administrative intent via LLM Gemini (with fallback)
  const prompt = `You are QueueWise AI Communicative Administrative Assistant for a medical clinic.
User Role: ${role}
User Message: "${message}"

Analyze the user's request and categorize into intent:
1. BOOK_APPOINTMENT: user wants to book a slot.
2. RESCHEDULE_APPOINTMENT: user wants to change an appointment.
3. CANCEL_APPOINTMENT: user wants to cancel.
4. JOIN_WAITLIST: user wants to join the waitlist.
5. GENERAL_QUERY: user is asking about clinic hours or availability.

Formulate a helpful, friendly response. If intent requires action, extract parameters.`;

  const schemaDescription = `{
  "intent": "BOOK_APPOINTMENT" | "RESCHEDULE_APPOINTMENT" | "CANCEL_APPOINTMENT" | "JOIN_WAITLIST" | "GENERAL_QUERY",
  "reply": "friendly assistant response string",
  "extractedParams": {
    "date": "YYYY-MM-DD or string",
    "startTime": "HH:mm or string",
    "doctorName": "string or null",
    "reason": "string or null"
  }
}`;

  const fallbackFn = () => ({
    intent: "GENERAL_QUERY",
    reply: `Hello! I'm your QueueWise AI Administrative Assistant. How can I help you manage your appointments or waitlist status today?`,
    extractedParams: {}
  });

  const { result } = await generateJSON({
    prompt,
    schemaDescription,
    fallbackFn,
    agentName: "AIAssistantChat"
  });

  res.json({
    success: true,
    reply: result.reply || fallbackFn().reply,
    intent: result.intent,
    extractedParams: result.extractedParams || {}
  });
}));

export default router;
