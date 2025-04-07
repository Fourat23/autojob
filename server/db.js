const { Pool } = require("pg");
const path = require("path");

// Load .env.test if NODE_ENV === "test"
require("dotenv").config({
  path:
    process.env.NODE_ENV === "test"
      ? path.resolve(__dirname, "../.env.test")
      : path.resolve(__dirname, "../.env"),
});

// Initialize PostgreSQL connection pool using env vars or fallback defaults
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "autojob",
  password: process.env.DB_PASSWORD || "NaruGoku9!2904", // ⚠️ Replace in .env for security!
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

// Connect and log only if not in test mode (to silence Jest noise)
if (process.env.NODE_ENV !== "test") {
  pool
    .connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch((err) => console.error("❌ PostgreSQL connection error:", err));
}

module.exports = pool;
