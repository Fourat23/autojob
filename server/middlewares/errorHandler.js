const logger = require("../logger");

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  logger.error(`[ERROR] ${req.method} ${req.originalUrl} → ${err.message}`);

  // Optional: more verbose in dev
  const isDev = process.env.NODE_ENV !== "production";

  res.status(status).json({
    error: "Server error",
    ...(isDev && { message: err.message, stack: err.stack }), // extra info in dev
  });
};

module.exports = errorHandler;
