const request = require("supertest");
const app = require("../../index");
const db = require("../../db");
const pool = require("../../db");

// 🧪 Mock the database module
jest.mock("../../db");

// 🧪 Mock Winston logger
jest.mock("../../logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const logger = require("../../logger");

// 🧪 Simulate a valid JWT (verifyToken is mocked)
const mockToken = "Bearer faketoken123";

// 🧪 Inject fake user via mocked middleware
jest.mock("../../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 1 }; // Simulate authenticated user
  next();
});

// 🧪 Attach the route if not already mounted in index.js
app.use("/api/me", require("../../routes/auth"));

describe("GET /api/me", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should return user profile when user is found", async () => {
    const fakeUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    db.query.mockResolvedValueOnce({ rows: [fakeUser] });

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual(fakeUser);
    expect(res.body.message).toMatch(/loaded/i);

    // 🧪 Confirm logger was called
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("[PROFILE] Fetching profile for user ID: 1")
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("User profile loaded")
    );
  });

  it("❌ should return 404 if user is not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found.");

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("User ID 1 not found")
    );
  });

  it("// ✅ should call error handler and return 500 on DB failure", async () => {
    db.query.mockRejectedValueOnce(new Error("💥 DB failure"));

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Server error");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching profile for user ID 1")
    );
  });
});

afterAll(async () => {
  await pool.end(); // 👌 Prevent Jest from hanging on DB pool
});
