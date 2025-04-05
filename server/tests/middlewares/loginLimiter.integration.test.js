const express = require("express");
const request = require("supertest");
const loginLimiter = require("../../middlewares/loginLimiter");

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

  it("✅ should allow first few attempts", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/test-login");
      expect(res.statusCode).toBe(200);
    }
  });

  it("❌ should block after too many attempts", async () => {
    // 6e requête => bloquée
    const res = await request(app).post("/test-login");
    expect(res.statusCode).toBe(429);
    expect(res.body).toHaveProperty(
      "error",
      "Too many login attempts. Please try again in 15 minutes."
    );
  });
});
