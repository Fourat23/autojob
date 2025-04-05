const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Use security headers middleware
app.use(helmet());

// ✅ Enable CORS for frontend connections
app.use(cors());

// ✅ Parse incoming JSON requests
app.use(express.json());

// ✅ Route: /api prefix for all backend routes
app.use("/api", authRoutes);

// ✅ Healthcheck route
app.use("/api", healthRoutes);

// ✅ Basic root route for quick testing
app.get("/", (req, res) => {
  res.send("🚀 AutoJob backend is running!");
});

// ✅ Launch server only if not in test mode (for Jest support)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export app instance for unit tests (supertest)
module.exports = app;
