const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// REGISTER CONTROLLER
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Invalid input." });
  }

  try {
    // Check if user already exists
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);

    if (userExists?.rows?.length > 0) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email.trim().toLowerCase(), hashedPassword]
    );

    res.status(201).json({
      message: "Account successfully created ✅",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server Error." });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN CONTROLLER
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    const user = result?.rows?.[0]; // Optional chaining to avoid crashes

    // Incorrect credentials: unified error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Sign JWT securely
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

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
    console.error("Login error:", err);
    res.status(500).json({ error: "Server Error." });
  }
};
