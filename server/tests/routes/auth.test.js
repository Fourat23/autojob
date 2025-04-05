// Import supertest to simulate HTTP requests
const request = require("supertest");
// Import the Express app (we export it from index.js)
const app = require("../../index");
// 🧹 Graceful teardown: close the PostgreSQL pool after all tests finish
const pool = require("../../db");
// Mock Database
jest.mock("../../db");
const db = require("../../db");

// Default behavior for db.query (unless overridden in specific tests)
beforeEach(() => {
  db.query.mockReset();
  db.query.mockResolvedValue({ rows: [] });
});

afterEach(() => {
  jest.clearAllMocks();
});

//
// ─── REGISTER ENDPOINT ───────────────────────────────────────────────
//

describe("POST /api/register", () => {
  it("❌ should return 400 if name or password is missing", async () => {
    const res = await request(app).post("/api/register").send({
      email: "missingfields@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("❌ should return 400 if email is already taken", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "taken@example.com" }],
    });

    const res = await request(app).post("/api/register").send({
      name: "Jean Dupont",
      email: "taken@example.com",
      password: "Password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it("✅ should register a user successfully", async () => {
    const email = "testuser" + Date.now() + "@example.com";
    const fakeUser = {
      id: 1,
      name: "Test User",
      email,
      created_at: new Date(),
    };

    db.query
      .mockResolvedValueOnce({ rows: [] }) // No user exists
      .mockResolvedValueOnce({ rows: [fakeUser] }); // Insert successful

    const res = await request(app).post("/api/register").send({
      name: fakeUser.name,
      email: fakeUser.email,
      password: "securePassword123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id", fakeUser.id);
    expect(res.body.user).toHaveProperty("email", fakeUser.email);
  });

  it("❌ should return 500 if db throws during register", async () => {
    db.query.mockImplementationOnce(() => {
      throw new Error("💥 DB failure simulated");
    });

    const res = await request(app).post("/api/register").send({
      name: "Crash User",
      email: "crash@example.com",
      password: "CrashPass123",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Server Error.");
  });

  it("❌ should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/register").send({
      name: "NoEmail",
      password: "Password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid input.");
  });
});

//
// ─── LOGIN ENDPOINT ─────────────────────────────────────────────────
//

describe("POST /api/login", () => {
  it("✅ should login successfully and return a token", async () => {
    const email = "logintest@example.com";
    const password = "TestPass123";

    const hashedPassword = await require("bcrypt").hash(password, 10);
    const fakeUser = {
      id: 1,
      name: "Login Tester",
      email,
      password: hashedPassword,
      created_at: new Date(),
    };

    db.query.mockResolvedValueOnce({ rows: [fakeUser] });

    const res = await request(app).post("/api/login").send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toHaveProperty("email", email);
  });

  it("❌ should return 400 if password is incorrect", async () => {
    const email = "wrongpass@example.com";
    const password = "CorrectPass123";
    const hashedPassword = await require("bcrypt").hash("AnotherPass123", 10);

    db.query.mockResolvedValueOnce({
      rows: [{ id: 2, name: "User", email, password: hashedPassword }],
    });

    const res = await request(app).post("/api/login").send({
      email,
      password,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid email or password.");
  });

  it("❌ should return 400 if email or password is missing", async () => {
    const res = await request(app).post("/api/login").send({
      email: "", // missing password
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email and password are required.");
  });
});

//
// ─── GET /me ─── Protected route with JWT ───────────────────────────────
//

describe("GET /api/me", () => {
  it("✅ should return user profile when token is valid", async () => {
    const email = "meuser@example.com";
    const password = "TestPass123";
    const jwt = require("jsonwebtoken");

    const token = jwt.sign({ id: 1, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Me User", email, created_at: new Date() }],
    });

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("email", email);
    expect(res.body.user).toHaveProperty("id");
  });

  it("❌ should return 401 if no token is provided", async () => {
    const res = await request(app).get("/api/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Access denied. No token provided.");
  });

  it("❌ should return 403 if token is invalid", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Invalid or expired token.");
  });
});

afterAll(async () => {
  // This ensures Jest doesn't hang due to open DB connections
  await pool.end();
});
