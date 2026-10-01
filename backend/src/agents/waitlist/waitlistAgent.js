import { getEligibleCandidates, createOfferService } from "../../services/waitlist.js";
import { generateJSON } from "../llm/llmClient.js";
import { logger } from "../../config/logger.js";

export async function runWaitlistAgent(context, { clinicId, doctorId, date, startTime, endTime }) {
  const candidates = await getEligibleCandidates({ clinicId, doctorId, date, startTime, endTime });

  if (!candidates || candidates.length === 0) {
    await context.recordStep({
      agentName: "WaitlistAgent",
      stepType: "THOUGHT",
      reasoning: "No active waitlist candidates match the cancelled appointment slot."
    });
    return { candidate: null, offer: null, candidatePoolExhausted: true };
  }

  const topCandidate = candidates[0];

  // Request LLM to evaluate ranking rationale & draft personalized offer message
  const prompt = `You are QueueWise Waitlist AI Agent.
Evaluate candidate ranking and draft a warm, professional SMS offer message for patient ${topCandidate.patientId.name}.
Cancelled Slot details:
- Date: ${date}
- Time: ${startTime} - ${endTime}
- Patient Preferred Days: ${JSON.stringify(topCandidate.preferredDays)}
- Patient Preferred Time Ranges: ${JSON.stringify(topCandidate.preferredTimeRanges)}

Draft a clear message stating the slot details and asking them to confirm.`;

  const schemaDescription = `{
  "reasoning": "string explaining why candidate is ranked #1",
  "offerMessage": "string personalized offer SMS"
}`;

  const fallbackFn = () => ({
    reasoning: `Ranked #1 based on FIFO joined at ${new Date(topCandidate.joinedAt).toLocaleTimeString()} and preferred time fit.`,
    offerMessage: `Hi ${topCandidate.patientId.name}, an earlier slot opened up on ${date} at ${startTime}. Reply ACCEPT to claim this appointment!`
  });

  const { result, isFallback, reasoning } = await generateJSON({
    prompt,
    schemaDescription,
    fallbackFn,
    agentName: "WaitlistAgent"
  });

  await context.recordStep({
    agentName: "WaitlistAgent",
    stepType: "THOUGHT",
    reasoning: `[LLM Ranking & Message Generation ${isFallback ? '(Fallback)' : '(Gemini)'}] ${reasoning}`
  });

  // Create the waitlist offer
  const offer = await createOfferService({
    waitlistId: topCandidate._id.toString(),
    slot: { doctorId, date, startTime, endTime },
    message: result.offerMessage || fallbackFn().offerMessage,
    ttlMinutes: 60
  });

  await context.recordStep({
    agentName: "WaitlistAgent",
    stepType: "TOOL_CALL",
    toolName: "create_waitlist_offer",
    inputParams: { waitlistId: topCandidate._id, slot: { doctorId, date, startTime, endTime } },
    outputResult: offer
  });

  return { candidate: topCandidate, offer, candidatePoolExhausted: false };
}
