import { seedDatabase } from "./seed.js";
import { logger } from "../config/logger.js";

export async function resetDemoData() {
  logger.info("Resetting demo environment to initial state...");
  return await seedDatabase();
}
