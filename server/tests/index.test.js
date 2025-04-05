// tests/index.test.js

// Import supertest to simulate HTTP requests
const request = require("supertest");

// Import the Express app instance
const app = require("../index");

//
// ─── BASIC ROUTES TEST ─────────────────────────────────────────────────────
//

describe("🚀 Basic routes", () => {
  // ✅ Health route test
  it("should return health check", async () => {
    const res = await request(app).get("/api/health");

    // ✅ Expect successful HTTP response
    expect(res.statusCode).toBe(200);

    // ✅ Expect expected structure in the response
    expect(res.body).toHaveProperty("database", "🟢 Connected");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });

  // ✅ Root route test
  it("should return root message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("🚀 AutoJob backend is running!");
  });
});
