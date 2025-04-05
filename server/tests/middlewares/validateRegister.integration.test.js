const express = require("express");
const request = require("supertest");
const validateRegister = require("../../middlewares/validateRegister");

describe("🧪 Integration test: validateRegister middleware", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Route temporaire test
    app.post("/test-validate-register", validateRegister, (req, res) => {
      res.status(200).json({ message: "Validation passed ✅" });
    });
  });

  it("❌ should return 400 if fields are missing", async () => {
    const res = await request(app).post("/test-validate-register").send({
      email: "bad@example.com",
      // name et password manquants
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid input.");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("✅ should pass if all fields are valid", async () => {
    const res = await request(app).post("/test-validate-register").send({
      name: "Fourat",
      email: "fourat@example.com",
      password: "SecurePass123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Validation passed ✅");
  });
});
