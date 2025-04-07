const verifyToken = require("../../middlewares/verifyToken");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 🧪 Mock Winston logger
jest.mock("../../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../../logger");

// 🧪 Mock Express response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Middleware: verifyToken", () => {
  const mockNext = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ❌ Case 1 — No token
  it("should return 401 if no token is provided", () => {
    const req = { headers: {}, ip: "127.0.0.1" };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access denied. No token provided.",
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Missing or malformed token")
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ❌ Case 2 — Invalid token
  it("should return 403 if token is invalid", () => {
    const req = {
      headers: { authorization: "Bearer invalidtoken" },
      ip: "192.168.1.5",
    };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token.",
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Invalid token from IP")
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  // ✅ Case 3 — Valid token
  it("should call next() and attach user to req if token is valid", () => {
    const validToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const req = {
      headers: { authorization: `Bearer ${validToken}` },
      ip: "::1",
    };
    const res = mockRes();

    verifyToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Token verified successfully")
    );
  });
});
