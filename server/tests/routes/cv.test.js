// 📄 Upload CV endpoint test suite

const request = require("supertest");
const app = require("../../index");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");

// 🧪 Mock database
jest.mock("../../db");
const db = require("../../db");

// 🧪 Graceful teardown for open connections
const pool = require("../../db");

// 🧪 Mock auth middleware (assumes user ID = 1)
jest.mock("../../middlewares/verifyToken", () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

// 🔁 Reset DB and mocks before each test
beforeEach(() => {
  db.query.mockReset();
  db.query.mockResolvedValue({ rows: [] });
});

// 🔁 Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// 📁 Path to the directory where test CVs are stored
const testUploadDir = path.join(__dirname, "../../uploads/cv/test");

//
// ─── TEST SUITE: Upload CV ──────────────────────────────────────────────
//

describe("POST /api/upload-cv", () => {
  const testCVPath = path.join(__dirname, "../test-files/test-cv.pdf");

  // ✅ Ensure test files and upload directory exist
  beforeAll(() => {
    // Create uploads/cv/test directory if missing
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }

    // Create a fake PDF for upload test
    if (!fs.existsSync(testCVPath)) {
      fs.mkdirSync(path.dirname(testCVPath), { recursive: true });
      // Write a minimal valid PDF header
      fs.writeFileSync(testCVPath, Buffer.from("%PDF-1.4\n", "ascii"));
    }
  });

  // ✅ Clean up uploaded test CVs after all tests
  afterAll(async () => {
    if (fs.existsSync(testUploadDir)) {
      const files = fs.readdirSync(testUploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testUploadDir, file));
      }
    }

    await pool.end(); // Close DB connection pool after tests
  });

  // ✅ Upload valid PDF
  it("✅ should upload a valid PDF file", async () => {
    jest.isolateModules(() => {
      jest.resetModules();

      jest.doMock("../../utils/validatePDF", () => ({
        __esModule: true,
        default: jest.fn(() => true),
      }));

      const isolatedApp = require("../../index");
      db.query.mockResolvedValueOnce({ rows: [] }); // No previous CV
      db.query.mockResolvedValueOnce(); // Successful update

      return request(isolatedApp)
        .post("/api/upload-cv")
        .attach("cv", testCVPath)
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body.message).toBe("CV uploaded successfully");
          expect(res.body.filename).toMatch(/\.pdf$/);
        });
    });
  });

  // ❌ Reject invalid (non-PDF) file
  it("❌ should reject non-PDF files", async () => {
    const fakeFileStream = Readable.from([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    ]);

    const res = await request(app)
      .post("/api/upload-cv")
      .attach("cv", fakeFileStream, {
        filename: "fake.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Invalid file type. Only PDF allowed."
    );
  });

  //   // ❌ Reject missing file
  //   it("❌ should return 400 if no file is provided", async () => {
  //     const res = await request(app).post("/api/upload-cv");
  //     expect(res.statusCode).toBe(400);
  //     expect(res.body.error).toBe("No file uploaded");
  //   });
});
