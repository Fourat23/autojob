const request = require("supertest");
const app = require("../index");
const db = require("../db");
const path = require("path");
const fs = require("fs");

// 🧪 Mock DB module
jest.mock("../db");

// 🧪 Mock verifyToken to simulate a logged-in user for /dashboard
jest.mock("../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

// 🧪 Mock Winston logger to suppress real logging during tests
jest.mock("../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../logger");

// 🧪 Inject a fake route that throws an error (for testing errorHandler)
const express = require("express");
const errorHandler = require("../middlewares/errorHandler"); // needed for the isolated route test

const createAppWithError = () => {
  const testApp = express();
  testApp.use(express.json());

  testApp.get("/test-error", (req, res, next) => {
    const err = new Error("Simulated crash");
    err.status = 500;
    next(err);
  });

  testApp.use(errorHandler);
  return testApp;
};

//
// ─── BASIC ROUTES TESTS ───────────────────────────────────────────────
//

describe("🚀 Basic routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Health check route
  it("should return health check", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("database", "🟢 Connected");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
  });

  // ✅ Root route
  it("should return root message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("🚀 AutoJob backend is running!");
  });

  // ✅ Minimal dashboard route integration
  it("should return dashboard data structure", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          title: "Frontend Dev",
          location: "Remote",
          status: "pending",
          applied_at: "2025-04-01T10:00:00Z",
        },
      ],
    });

    const res = await request(app).get("/api/dashboard");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cv");
    expect(res.body).toHaveProperty("applications");
    expect(Array.isArray(res.body.applications)).toBe(true);

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Fetching dashboard data")
    );
  });

  // ❌ Global error handler test
  it("should handle errors globally and log them", async () => {
    const testApp = createAppWithError();

    const res = await request(testApp).get("/test-error");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Server error");
    expect(res.body).toHaveProperty("message", "Simulated crash");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR] GET /test-error → Simulated crash")
    );
  });

  // ✅ CV upload route is mounted
  it("should return 400 if no CV file is uploaded", async () => {
    const res = await request(app).post("/api/upload-cv");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "No file uploaded");
  });

  // ✅ Should reject invalid file type with proper error (Multer)
  it("should return 400 if file type is invalid (non-PDF)", async () => {
    const { Readable } = require("stream");
    const fakeStream = Readable.from([Buffer.from([0x89, 0x50, 0x4e, 0x47])]);

    const res = await request(app)
      .post("/api/upload-cv")
      .attach("cv", fakeStream, {
        filename: "not-a-pdf.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Invalid file type. Only PDF allowed."
    );
  });
});
