const request = require("supertest");
const app = require("../../index");
const db = require("../../db");

// 🧹 Graceful teardown: close the PostgreSQL pool after all tests finish
const pool = require("../../db");

// Mock the database module to avoid real DB calls
jest.mock("../../db");

// Simulate a valid JWT (you won't decode it, because verifyToken is mocked)
const mockToken = "Bearer faketoken123";

// Mock the verifyToken middleware to inject a fake user
jest.mock("../../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 1 }; // Simulate user ID from token
  next();
});

// Make sure the route exists and runs with mocked middleware
app.use("/api/me", require("../../routes/auth"));

describe("GET /api/me", () => {
  // Clear mocks after each test to avoid leaks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Success path — profile returned
  it("✅ should return user profile when user is found", async () => {
    const fakeUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    // Simulate a successful DB query returning the user
    db.query.mockResolvedValueOnce({ rows: [fakeUser] });

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual(fakeUser);
    expect(res.body.message).toMatch(/loaded/i);
  });

  // ❌ Error path — user not found in DB
  it("❌ should return 404 if user is not found", async () => {
    // Simulate DB query returning no user
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found.");
  });

  // ❌ Error path — database throws an error
  it("❌ should return 500 on database error", async () => {
    // Simulate DB failure
    db.query.mockRejectedValueOnce(new Error("💥 DB failure"));

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Server error.");
  });
});

afterAll(async () => {
  // This ensures Jest doesn't hang due to open DB connections
  await pool.end();
});
