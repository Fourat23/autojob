const request = require("supertest");
const app = require("../../index");
const db = require("../../db");

// 🧪 Mock DB module
jest.mock("../../db");

// 🧪 Mock logger to suppress logs during test
jest.mock("../../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../../logger");

// 🧪 Mock verifyToken middleware
jest.mock("../../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 1 }; // Simulated logged-in user
  next();
});

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should return CV info and recent applications", async () => {
    // Simulate DB returning fake applications
    const fakeApplications = [
      {
        id: 1,
        title: "Frontend Developer",
        location: "Paris",
        status: "pending",
        applied_at: "2025-04-02T08:00:00Z",
      },
      {
        id: 2,
        title: "Backend Developer",
        location: "Lyon",
        status: "accepted",
        applied_at: "2025-04-01T14:30:00Z",
      },
    ];

    db.query.mockResolvedValueOnce({ rows: fakeApplications });

    const res = await request(app).get("/api/dashboard");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cv");
    expect(res.body.cv.filename).toBe("cv_fourat.pdf");
    expect(res.body).toHaveProperty("applications");
    expect(Array.isArray(res.body.applications)).toBe(true);
    expect(res.body.applications.length).toBe(2);

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Fetching dashboard data")
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Retrieved 2 applications")
    );
  });

  it("❌ should return 500 and call error handler if DB throws", async () => {
    db.query.mockRejectedValueOnce(new Error("💥 Simulated DB crash"));

    const res = await request(app).get("/api/dashboard");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Server error");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error while loading data")
    );
  });
});
