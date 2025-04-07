const rateLimit = require("express-rate-limit");
const logger = require("../logger"); // ✅ Import Winston logger

// Apply rate limiting specifically to login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  // ✅ Log when a request is blocked
  handler: (req, res, next, options) => {
    logger.warn(
      `[RATE LIMIT] Too many login attempts from IP ${req.ip} — blocked.`
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = loginLimiter;
