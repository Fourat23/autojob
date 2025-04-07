const db = require("../db");
const logger = require("../logger"); // Winston logger

// Controller to handle GET /me
// This route returns the full user profile from the database
exports.getProfile = async (req, res, next) => {
  const userId = req.user.id;

  logger.info(`[PROFILE] Fetching profile for user ID: ${userId}`);

  try {
    // Query the user info from the database
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    const user = result.rows[0];

    // If no user found, return a 404 error
    if (!user) {
      logger.warn(`[PROFILE] User ID ${userId} not found`);
      return res.status(404).json({ error: "User not found." });
    }

    // Log and respond with user data
    logger.info(`[PROFILE] User profile loaded: ${user.email}`);

    res.status(200).json({
      message: "User profile loaded ✅",
      user,
    });
  } catch (err) {
    // Log and forward error to errorHandler
    logger.error(
      `[PROFILE] Error fetching profile for user ID ${userId}: ${err.message}`
    );
    next(err); // 🔁 Send to global error handler
  }
};
