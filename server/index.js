const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const dashboardRoutes = require("./routes/dashboard");
const cvRoutes = require("./routes/cv");

const logger = require("./logger"); // ✅ Winston logger
const multerErrorHandler = require("./middlewares/multerErrorHandler"); // ✅ Error Multer middleware
const errorHandler = require("./middlewares/errorHandler"); // ✅ Error middleware

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Security middleware
app.use(helmet());
logger.info("🛡️ Helmet middleware enabled");

app.use(cors());
logger.info("🌐 CORS middleware enabled");

app.use(express.json());
logger.info("🔄 JSON parser middleware enabled");

// ✅ Routes
app.use("/api", authRoutes);
app.use("/api", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", cvRoutes);
logger.info("🧭 All API routes mounted under /api");

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🚀 AutoJob backend is running!");
});

// ✅ handles Multer errors
app.use(multerErrorHandler);
// ✅ Global error handler (must be last)
app.use(errorHandler);

// ✅ Start server (except during test mode)
/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`✅ Server running on http://localhost:${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
