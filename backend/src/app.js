import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Routes
import authRoutes from "./routes/auth.js";
import { clinicRouter, doctorRouter, patientRouter } from "./routes/coreEntities.js";
import appointmentRoutes from "./routes/appointments.js";
import waitlistRoutes from "./routes/waitlist.js";
import approvalRoutes from "./routes/approvals.js";
import agentRunRoutes from "./routes/agentRuns.js";
import demoRoutes from "./routes/demo.js";
import notificationRoutes from "./routes/notifications.js";
import aiAssistantRoutes from "./routes/aiAssistant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Rate limiter for API routes
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "QueueWise AI Backend", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/agent-runs", agentRunRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);

// Static frontend serving if built
const candidateDistPaths = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../dist"),
  path.resolve(__dirname, "../dist")
];
const frontendDist = candidateDistPaths.find(p => fs.existsSync(path.join(p, "index.html")));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      service: "QueueWise AI Backend API",
      health: "/health",
      version: "1.0.0"
    });
  });
}

// Global Error Handler
app.use(errorHandler);

export default app;
