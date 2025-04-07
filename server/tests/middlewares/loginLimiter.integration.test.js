const express = require("express");
const request = require("supertest");
const loginLimiter = require("../../middlewares/loginLimiter");

// 🧪 Mock logger
jest.mock("../../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../../logger");

describe("🧪 Integration test: loginLimiter middleware", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Route de test protégée par loginLimiter
    app.post("/test-login", loginLimiter, (req, res) => {
      res.status(200).json({ message: "Login accepted ✅" });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should allow first few attempts", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/test-login");
      expect(res.statusCode).toBe(200);
    }
  });

  it("❌ should block after too many attempts", async () => {
    const res = await request(app).post("/test-login");

    expect(res.statusCode).toBe(429);
    expect(res.body).toHaveProperty(
      "error",
      "Too many login attempts. Please try again in 15 minutes."
    );

    // 🧪 Assert that logger.warn was called
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Too many login attempts from IP")
    );
  });
});
