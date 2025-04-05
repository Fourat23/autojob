const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { getProfile } = require("../controllers/userController");
const validateRegister = require("../middlewares/validateRegister");
const loginLimiter = require("../middlewares/loginLimiter");
const verifyToken = require("../middlewares/verifyToken");

// GET /api/me → Return authenticated user's profile
router.get("/me", verifyToken, getProfile);

// POST /api/register → create a new user with validation
router.post("/register", validateRegister, register);

// POST /api/login → login an existing user
router.post("/login", loginLimiter, login);

module.exports = router;
