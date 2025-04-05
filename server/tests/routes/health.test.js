const request = require("supertest");
const app = require("../../index");

describe("✅ GET /api/health", () => {
  it("should return full system health", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "✅ OK");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("database", "🟢 Connected");
  });
});
