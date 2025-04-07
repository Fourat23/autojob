const errorHandler = require("../../middlewares/errorHandler");

// 🧪 Mock logger to avoid actual log writing
jest.mock("../../logger", () => ({
  error: jest.fn(),
}));
const logger = require("../../logger");

// Utility: mock Express response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("🧪 Middleware: errorHandler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should return full error details in development mode", () => {
    process.env.NODE_ENV = "development";

    const err = new Error("Test dev error");
    const req = { method: "GET", originalUrl: "/test-dev" };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Server error",
        message: "Test dev error",
        stack: expect.any(String),
      })
    );

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR] GET /test-dev → Test dev error")
    );
  });

  it("✅ should hide stack/message in production", () => {
    process.env.NODE_ENV = "production";

    const err = new Error("Sensitive info");
    const req = { method: "POST", originalUrl: "/secure-route" };
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR] POST /secure-route → Sensitive info")
    );
  });

  it("✅ should use provided status code from error object", () => {
    process.env.NODE_ENV = "development";

    const err = new Error("Unauthorized access");
    err.status = 401;
    const req = { method: "GET", originalUrl: "/private" };
    const res = mockRes();

    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Server error",
        message: "Unauthorized access",
      })
    );
  });
});
