const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../logger"); // Winston logger

// ─────────────────────────────────────────────────────────────
// REGISTER CONTROLLER
// ─────────────────────────────────────────────────────────────
// Handles user registration
// Validates inputs, hashes password, inserts user into database
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if all required fields are present
  if (!name || !email || !password) {
    logger.warn("[REGISTER] Missing input fields");
    return res.status(400).json({ error: "Invalid input." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    logger.info(`[REGISTER] Attempt to register ${normalizedEmail}`);

    // Check if user already exists
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    if (userExists?.rows?.length > 0) {
      logger.warn(`[REGISTER] Email already used: ${normalizedEmail}`);
      return res.status(400).json({ error: "Email already in use." });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info(`[REGISTER] Password hashed for ${normalizedEmail}`);

    // Insert new user into database
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, normalizedEmail, hashedPassword]
    );

    const newUser = result.rows[0];
    logger.info(
      `[REGISTER] New account created for ${newUser.email} (ID: ${newUser.id})`
    );

    // Respond with user info (excluding password)
    res.status(201).json({
      message: "Account successfully created ✅",
      user: newUser,
    });
  } catch (err) {
    // Log and forward unexpected errors
    logger.error(`[REGISTER] Unexpected error: ${err.message}`);
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN CONTROLLER
// ─────────────────────────────────────────────────────────────
// Handles user login
// Validates credentials and returns a signed JWT
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are present
  if (!email || !password) {
    logger.warn("[LOGIN] Missing credentials");
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  logger.info(`[LOGIN] Login attempt for ${normalizedEmail}`);

  try {
    // Look up user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    const user = result?.rows?.[0];

    // If user not found or password doesn't match
    const passwordMatches =
      user && (await bcrypt.compare(password, user.password));
    if (!user || !passwordMatches) {
      logger.warn(`[LOGIN] Invalid credentials for ${normalizedEmail}`);
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Create JWT with user ID and email
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    logger.info(`[LOGIN] Login successful for ${user.email} (ID: ${user.id})`);

    // Respond with token and user info
    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    // Log and forward unexpected errors
    logger.error(`[LOGIN] Unexpected error: ${err.message}`);
    next(err);
  }
};
