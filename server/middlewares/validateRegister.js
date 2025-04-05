const { body, validationResult } = require('express-validator');

// Validation middleware for /register
const validateRegister = [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
      }
      next();
    }
];

module.exports = validateRegister;
