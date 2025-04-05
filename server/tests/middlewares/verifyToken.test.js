// Import the middleware we want to test
const verifyToken = require("../../middlewares/verifyToken");
require("dotenv").config();

// Import jsonwebtoken to generate a valid token for tests
const jwt = require("jsonwebtoken");

// Helper to mock the Express response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // allow chaining .status().json()
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Middleware: verifyToken", () => {
  const mockNext = jest.fn(); // To track if next() was called

  // ❌ Case 1 — No token provided at all
  it("should return 401 if no token is provided", () => {
    const req = { headers: {} };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    // Should return a 401 error
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access denied. No token provided.",
    });

    // Should NOT continue to next middleware
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ❌ Case 2 — Malformed or invalid token
  it("should return 403 if token is invalid", () => {
    const req = { headers: { authorization: "Bearer invalidtoken" } };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    // Should return a 403 error
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token.",
    });

    expect(mockNext).not.toHaveBeenCalled();
  });

  // ✅ Case 3 — Valid token
  it("should call next() and attach user to req if token is valid", () => {
    // Generate a valid JWT
    const validToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    // Middleware should validate token and call next()
    expect(mockNext).toHaveBeenCalled();

    // User info should be attached to the request
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
  });
});
