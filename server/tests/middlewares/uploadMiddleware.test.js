const multer = require("multer");
const crypto = require("crypto");

jest.mock("crypto");

const { _test } = require("../../middlewares/uploadMiddleware");
const { fileFilter, filenameFn, destinationFn } = _test;

describe("🧩 uploadMiddleware", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    crypto.randomUUID.mockReturnValue("test-uuid");
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  //
  // ─── FILE FILTER ─────────────────────────────────────────────
  //

  describe("fileFilter", () => {
    it("✅ should accept PDF mimetype", () => {
      const req = {};
      const file = { mimetype: "application/pdf" };
      const cb = jest.fn();

      fileFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("❌ should reject non-PDF mimetype with MulterError", () => {
      const req = {};
      const file = { mimetype: "image/png", fieldname: "cv" };
      const cb = jest.fn();

      fileFilter(req, file, cb);

      expect(cb).toHaveBeenCalledWith(expect.any(multer.MulterError));
      expect(cb.mock.calls[0][0].message).toBe("Only PDF files are allowed");
    });
  });

  //
  // ─── STORAGE ─────────────────────────────────────────────────
  //

  describe("storage functions", () => {
    it("✅ should use uploads/cv/test as destination in test env", () => {
      process.env.NODE_ENV = "test";
      const cb = jest.fn();
      destinationFn({}, {}, cb);
      expect(cb).toHaveBeenCalledWith(null, "uploads/cv/test");
    });
  });
});

const fs = require("fs");
const path = require("path");

afterAll(() => {
  const testDir = path.join(__dirname, "../../uploads/cv/test");
  if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir);
    for (const file of files) {
      const filePath = path.join(testDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("⚠️ Failed to delete test file:", filePath, err.message);
      }
    }
  }
});
