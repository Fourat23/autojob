const express = require("express");
const request = require("supertest");
const validateRegister = require("../../middlewares/validateRegister");

// 🧪 Mock logger
jest.mock("../../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../../logger");

describe("🧪 Integration test: validateRegister middleware", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post("/test-validate-register", validateRegister, (req, res) => {
      res.status(200).json({ message: "Validation passed ✅" });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("❌ should return 400 if fields are missing", async () => {
    const res = await request(app).post("/test-validate-register").send({
      email: "bad@example.com",
      // Missing name and password
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid input.");
    expect(Array.isArray(res.body.details)).toBe(true);

    // 🧪 Check that logger.warn was triggered
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("[VALIDATION] Invalid /register input"),
      expect.any(Array)
    );
  });

  it("✅ should pass if all fields are valid", async () => {
    const res = await request(app).post("/test-validate-register").send({
      name: "Fourat",
      email: "fourat@example.com",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Validation passed ✅");

    // 🧪 Nothing should be logged as a warning
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
