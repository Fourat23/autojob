// server/routes/dashboard.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getDashboardData } = require("../controllers/dashboardController");

// Protected route to get dashboard data
router.get("/", verifyToken, getDashboardData);

module.exports = router;
