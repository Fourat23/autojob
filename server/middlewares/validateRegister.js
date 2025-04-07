const { body, validationResult } = require("express-validator");
const logger = require("../logger"); // ✅ Import logger

// Validation middleware for /register
const validateRegister = [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const details = errors.array();
      logger.warn(
        `[VALIDATION] Invalid /register input from ${req.ip}:`,
        details
      );

      return res.status(400).json({ error: "Invalid input.", details });
    }

    next();
  },
];

module.exports = validateRegister;
