const { register, login } = require("../../controllers/authController");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../db");

// Mocks for external modules
jest.mock("../../db");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// Helper: create mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Chainable
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("🧪 authController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //
  // ─── REGISTER TESTS ─────────────────────────────────────
  //
  describe("register", () => {
    it("❌ should return 400 if any field is missing", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid input." });
    });

    it("❌ should return 400 if user already exists", async () => {
      const req = {
        body: { name: "Test", email: "test@example.com", password: "pass123" },
      };
      const res = mockRes();

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already in use." });
    });

    it("✅ should register new user and return 201", async () => {
      const req = {
        body: { name: "John", email: "john@example.com", password: "pass123" },
      };
      const res = mockRes();

      db.query
        .mockResolvedValueOnce({ rows: [] }) // No user exists
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              name: "John",
              email: "john@example.com",
              created_at: "2024-01-01T00:00:00.000Z",
            },
          ],
        });

      bcrypt.hash.mockResolvedValue("hashedPassword");

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringMatching(/created/i),
        user: expect.objectContaining({
          id: 1,
          email: "john@example.com",
        }),
      });
    });

    it("❌ should return 500 on DB error", async () => {
      const req = {
        body: { name: "Jane", email: "jane@example.com", password: "pass123" },
      };
      const res = mockRes();

      db.query.mockRejectedValueOnce(new Error("DB error"));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server Error." });
    });
  });

  //
  // ─── LOGIN TESTS ────────────────────────────────────────
  //
  describe("login", () => {
    it("❌ should return 400 if email or password is missing", async () => {
      const req = { body: { email: "" } };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required.",
      });
    });

    it("❌ should return 400 if user is not found", async () => {
      const req = {
        body: { email: "notfound@example.com", password: "pass123" },
      };
      const res = mockRes();

      db.query.mockResolvedValueOnce({ rows: [] });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password.",
      });
    });

    it("❌ should return 400 if password is invalid", async () => {
      const req = {
        body: { email: "john@example.com", password: "wrongpass" },
      };
      const res = mockRes();

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "john@example.com",
            password: "hashed",
          },
        ],
      });

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password.",
      });
    });

    it("✅ should login and return token", async () => {
      const req = {
        body: { email: "john@example.com", password: "validpass" },
      };
      const res = mockRes();

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "John",
            email: "john@example.com",
            password: "hashedPassword",
            created_at: "2024-01-01T00:00:00.000Z",
          },
        ],
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("faketoken");

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful ✅",
        token: "faketoken",
        user: expect.objectContaining({
          email: "john@example.com",
        }),
      });
    });

    it("❌ should return 500 on DB error", async () => {
      const req = {
        body: { email: "john@example.com", password: "pass" },
      };
      const res = mockRes();

      db.query.mockRejectedValueOnce(new Error("DB crash"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server Error." });
    });
  });
});

afterAll(async () => {
  // This ensures Jest doesn't hang due to open DB connections
  await pool.end();
});
