const jwt = require("jsonwebtoken");
const logger = require("../logger"); // ✅ Winston logger

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn(`[AUTH] Missing or malformed token from IP: ${req.ip}`);
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    logger.info(
      `[AUTH] Token verified successfully for user ID: ${decoded.id}`
    );
    next();
  } catch (err) {
    logger.warn(`[AUTH] Invalid token from IP: ${req.ip} — ${err.message}`);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
