import { logger } from "../config/logger.js";

export function errorHandler(err, req, res, next) {
  let { statusCode = 500, message } = err;

  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  logger.error(`[API Error ${statusCode}] ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}
