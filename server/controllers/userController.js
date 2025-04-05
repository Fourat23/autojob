const db = require("../db");

// Controller to handle GET /me
// This route returns the full user profile from the database
exports.getProfile = async (req, res) => {
  // Extract the user ID from the decoded JWT (set in verifyToken middleware)
  const userId = req.user.id;

  try {
    // Query the database to find the user's profile by ID
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    const user = result.rows[0];

    // If no user is found, return a 404 error
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // If found, return the user data (excluding password)
    res.status(200).json({
      message: "User profile loaded ✅",
      user,
    });
  } catch (err) {
    // Handle and log server/database errors
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error." });
  }
};
