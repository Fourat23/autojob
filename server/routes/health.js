const express = require("express");
const router = express.Router();
const db = require("../db");

// Full health check
router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT NOW()");

    res.status(200).json({
      status: "✅ OK",
      timestamp: new Date().toISOString(),
      database: "🟢 Connected",
      uptime: `${process.uptime().toFixed(2)}s`,
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);

    res.status(503).json({
      status: "❌ Service Unavailable",
      error: err.message,
    });
  }
});

module.exports = router;
