// tests/routes/dashboard.test.js
const request = require("supertest");
const app = require("../../index");
const db = require("../../db");

// 🧪 Mock the database module
jest.mock("../../db");

// 🧪 Mock verifyToken middleware to simulate authentication
jest.mock("../../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 42 }; // Fake authenticated user
  next();
});

describe("GET /api/dashboard (route)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return dashboard data (CV + applications)", async () => {
    // 🧪 Fake DB response
    const mockApplications = [
      {
        id: 101,
        title: "Fullstack Developer",
        location: "Remote",
        status: "pending",
        applied_at: "2025-04-01T08:00:00Z",
      },
    ];

    db.query.mockResolvedValueOnce({ rows: mockApplications });

    // 🔥 Send request to the route
    const res = await request(app).get("/api/dashboard");

    // ✅ Expectations
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cv");
    expect(res.body).toHaveProperty("applications");
    expect(res.body.applications.length).toBe(1);
    expect(res.body.applications[0]).toHaveProperty("title", "Fullstack Developer");
  });

  it("should return 500 if DB fails", async () => {
    db.query.mockRejectedValueOnce(new Error("💥 DB error"));

    const res = await request(app).get("/api/dashboard");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Server error");
  });
});
