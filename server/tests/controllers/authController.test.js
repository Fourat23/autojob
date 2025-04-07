const { register, login } = require("../../controllers/authController");
const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../db");

// 🧪 Mock external modules
jest.mock("../../db");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// 🧪 Mock logger to suppress real logs during test
jest.mock("../../logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// 🧪 Utility: mock Express response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
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
      const next = jest.fn();

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid input." });
      expect(next).not.toHaveBeenCalled();
    });

    it("❌ should return 400 if user already exists", async () => {
      const req = {
        body: { name: "Test", email: "test@example.com", password: "pass123" },
      };
      const res = mockRes();
      const next = jest.fn();

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email already in use." });
      expect(next).not.toHaveBeenCalled();
    });

    it("✅ should register new user and return 201", async () => {
      const req = {
        body: { name: "John", email: "john@example.com", password: "pass123" },
      };
      const res = mockRes();
      const next = jest.fn();

      db.query
        .mockResolvedValueOnce({ rows: [] }) // No user
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

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringMatching(/created/i),
        user: expect.objectContaining({
          id: 1,
          email: "john@example.com",
        }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("❌ should call next(err) on unexpected error", async () => {
      const req = {
        body: { name: "Jane", email: "jane@example.com", password: "pass123" },
      };
      const res = mockRes();
      const next = jest.fn();

      db.query.mockRejectedValueOnce(new Error("DB crash"));

      await register(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  //
  // ─── LOGIN TESTS ────────────────────────────────────────
  //
  describe("login", () => {
    it("❌ should return 400 if email or password is missing", async () => {
      const req = { body: { email: "" } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("❌ should return 400 if user is not found", async () => {
      const req = {
        body: { email: "notfound@example.com", password: "pass123" },
      };
      const res = mockRes();
      const next = jest.fn();

      db.query.mockResolvedValueOnce({ rows: [] });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("❌ should return 400 if password is invalid", async () => {
      const req = {
        body: { email: "john@example.com", password: "wrongpass" },
      };
      const res = mockRes();
      const next = jest.fn();

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

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("✅ should login and return token", async () => {
      const req = {
        body: { email: "john@example.com", password: "validpass" },
      };
      const res = mockRes();
      const next = jest.fn();

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

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful ✅",
        token: "faketoken",
        user: expect.objectContaining({
          email: "john@example.com",
        }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("❌ should call next(err) on unexpected error", async () => {
      const req = {
        body: { email: "john@example.com", password: "pass" },
      };
      const res = mockRes();
      const next = jest.fn();

      db.query.mockRejectedValueOnce(new Error("Unexpected login failure"));

      await login(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

// 🧹 Cleanup after all tests
afterAll(async () => {
  await pool.end();
});
