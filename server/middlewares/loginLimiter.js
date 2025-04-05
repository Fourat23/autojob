const rateLimit = require('express-rate-limit');

// Apply rate limiting specifically to login route
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
      error: 'Too many login attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;