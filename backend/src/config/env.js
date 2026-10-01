import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/queuewise",
  JWT_SECRET: process.env.JWT_SECRET || "queuewise-super-secret-jwt-key-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  DEMO_MODE: process.env.DEMO_MODE !== "false",
  FORCE_LLM_FAILURE: process.env.FORCE_LLM_FAILURE === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};
