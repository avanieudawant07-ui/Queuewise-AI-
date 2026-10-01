import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

// Lazy-initialize so the API key is always read fresh at request time
function getGenAI() {
  if (!env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

async function callGroq({ prompt, schemaDescription, agentName }) {
  if (!env.GROQ_API_KEY) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are QueueWise AI, an autonomous clinic coordination system. Return ONLY a valid JSON object matching this schema format:\n${schemaDescription}\nDo not wrap in markdown or backticks. Return raw JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "{}";
  const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleanText);

  return {
    result: parsed,
    isFallback: false,
    rawResponse: text,
    reasoning: parsed.reasoning || `LLM evaluated via Groq (${env.GROQ_MODEL || "openai/gpt-oss-120b"}).`
  };
}

async function callGemini({ prompt, schemaDescription, agentName }) {
  const genAI = getGenAI();
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL || "gemini-3.8-flash" });
  const fullPrompt = `${prompt}\n\nReturn ONLY a valid JSON object matching this schema format:\n${schemaDescription}\nDo not include code markdown formatting or extra text.`;

  const response = await model.generateContent(fullPrompt);
  const text = response.response.text().trim();
  const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleanText);

  return {
    result: parsed,
    isFallback: false,
    rawResponse: text,
    reasoning: parsed.reasoning || "LLM evaluated ranking & text generation via Gemini."
  };
}

export async function generateJSON({ prompt, schemaDescription, fallbackFn, agentName = "Agent" }) {
  // If FORCE_LLM_FAILURE toggle is active in demo or no API key, execute deterministic fallback
  if (env.FORCE_LLM_FAILURE) {
    logger.warn(`[${agentName}] FORCE_LLM_FAILURE flag is active. Executing deterministic fallback engine.`);
    return {
      result: fallbackFn(),
      isFallback: true,
      reasoning: "Deterministic rule engine (FORCED_FAILURE_DEMO)"
    };
  }

  // 1. Prioritize Groq LLM if GROQ_API_KEY is configured
  if (env.GROQ_API_KEY) {
    try {
      const groqRes = await callGroq({ prompt, schemaDescription, agentName });
      if (groqRes) {
        logger.info(`[${agentName}] Successfully generated response using Groq (${env.GROQ_MODEL || "openai/gpt-oss-120b"}).`);
        return groqRes;
      }
    } catch (err) {
      logger.error(`[${agentName}] Groq LLM generation error: ${err.message}. Trying Gemini fallback...`);
    }
  }

  // 2. Fall back to Gemini if GEMINI_API_KEY is configured
  if (env.GEMINI_API_KEY) {
    try {
      const geminiRes = await callGemini({ prompt, schemaDescription, agentName });
      if (geminiRes) {
        logger.info(`[${agentName}] Successfully generated response using Gemini (${env.GEMINI_MODEL}).`);
        return geminiRes;
      }
    } catch (err) {
      logger.error(`[${agentName}] Gemini LLM generation error: ${err.message}. Falling back to deterministic engine.`);
    }
  }

  // 3. Fallback to deterministic rule engine
  logger.info(`[${agentName}] No LLM provider available or calls failed. Using deterministic fallback.`);
  return {
    result: fallbackFn(),
    isFallback: true,
    reasoning: "Deterministic rule engine (NO_LLM_AVAILABLE)"
  };
}
