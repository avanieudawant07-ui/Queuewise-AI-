import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";
import { logger } from "./logger.js";

let mongoServer = null;

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    
    // Try connecting to primary MONGODB_URI
    if (env.MONGODB_URI && !env.MONGODB_URI.includes("memory")) {
      try {
        logger.info(`Connecting to MongoDB at ${env.MONGODB_URI}...`);
        await mongoose.connect(env.MONGODB_URI, {
          serverSelectionTimeoutMS: 3000
        });
        logger.info("Connected to MongoDB database successfully.");
        return;
      } catch (err) {
        logger.warn(`Failed to connect to configured MONGODB_URI: ${err.message}. Falling back to MongoMemoryServer...`);
      }
    }

    // Fallback to in-memory MongoDB
    logger.info("Starting MongoMemoryServer instance...");
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    logger.info(`Connected to MongoMemoryServer at ${uri}`);
  } catch (err) {
    logger.error("Failed to connect to any MongoDB instance:", err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
