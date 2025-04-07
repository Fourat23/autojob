const db = require("../db");
const fs = require("fs");
const path = require("path");
const isValidPDF = require("../utils/validatePDF");

// Upload and save user CV
exports.uploadCV = async (req, res, next) => {
  try {
    const userId = req.user.id; // Extracted from JWT token (auth middleware)
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate actual file content (not just extension/mimetype)
    if (!isValidPDF(file.path)) {
      fs.unlinkSync(file.path); // Immediately delete the invalid file
      return res.status(400).json({ error: "File is not a valid PDF" });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, "..", "uploads", "cv");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Check if the user already has a CV, and delete the old one
    const result = await db.query(
      "SELECT cv_filename FROM users WHERE id = $1",
      [userId]
    );

    const oldFilename = result.rows[0]?.cv_filename;

    if (oldFilename) {
      const oldPath = path.join(uploadDir, oldFilename);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Securely delete previous CV
        }
      } catch (fsErr) {
        console.warn(
          "⚠️ Failed to delete old CV (safe to ignore in tests)",
          fsErr.message
        );
      }
    }

    // Save new CV filename to database
    await db.query(
      "UPDATE users SET cv_filename = $1, cv_uploaded_at = NOW() WHERE id = $2",
      [file.filename, userId]
    );

    return res.status(200).json({
      message: "CV uploaded successfully",
      filename: file.filename,
    });
  } catch (err) {
    // Forward error to global handler
    err.status = 500;
    err.message = err.message || "CV upload failed";
    next(err);
  }
};
