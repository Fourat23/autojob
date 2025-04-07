const db = require("../db");
const logger = require("../logger"); // ✅ Winston logger

// Controller to handle GET /api/dashboard
// Returns user's CV and recent applications
exports.getDashboardData = async (req, res, next) => {
  const userId = req.user.id;

  logger.info(`[DASHBOARD] Fetching dashboard data for user ID: ${userId}`);

  try {
    // Static simulated CV for now (can be replaced with DB later)
    const cv = {
      filename: "cv_fourat.pdf",
      uploadedAt: new Date("2025-04-03T10:00:00Z"),
    };

    logger.info(`[DASHBOARD] Static CV loaded: ${cv.filename}`);

    // Fetch the user's most recent 5 job applications
    const result = await db.query(
      "SELECT id, title, location, status, applied_at FROM applications WHERE user_id = $1 ORDER BY applied_at DESC LIMIT 5",
      [userId]
    );

    const applications = result.rows;

    logger.info(
      `[DASHBOARD] Retrieved ${applications.length} applications for user ${userId}`
    );

    // Return combined CV and application data
    res.status(200).json({ cv, applications });
  } catch (err) {
    // Log unexpected error and pass it to the global handler
    logger.error(
      `[DASHBOARD] Error while loading data for user ${userId}: ${err.message}`
    );
    next(err);
  }
};
