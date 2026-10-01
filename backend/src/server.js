import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./config/logger.js";
import { seedDatabase } from "./seed/seed.js";

async function startServer() {
  try {
    await connectDB();
    
    // Auto-seed demo data on startup if in development/demo mode
    if (env.DEMO_MODE) {
      await seedDatabase();
    }

    app.listen(env.PORT, () => {
      logger.info(`=================================================`);
      logger.info(`  QueueWise AI Backend Server running on port ${env.PORT}`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  Demo Mode: ${env.DEMO_MODE}`);
      logger.info(`=================================================`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
