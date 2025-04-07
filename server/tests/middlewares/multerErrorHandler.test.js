const request = require("supertest");
const express = require("express");
const multerErrorHandler = require("../../middlewares/multerErrorHandler");

describe("🧪 Multer Error Handler", () => {
  let app;

  beforeEach(() => {
    app = express();

    // Fake route that simulates a Multer file type rejection
    app.get("/test-multer", (req, res, next) => {
      const err = new Error("Only PDF files are allowed");
      err.name = "MulterError";
      next(err);
    });

    // Middleware under test
    app.use(multerErrorHandler);
  });

  it("✅ should return 400 for invalid file type", async () => {
    const res = await request(app).get("/test-multer");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid file type. Only PDF allowed.");
  });

  it("✅ should forward non-multer errors to next handler", async () => {
    // Simulate a non-multer error
    const errApp = express();
    errApp.get("/test-next", (req, res, next) => {
      const err = new Error("Something else failed");
      next(err);
    });

    const fallbackHandler = (err, req, res, next) => {
      res.status(500).json({ fallback: true, message: err.message });
    };

    errApp.use(multerErrorHandler);
    errApp.use(fallbackHandler);

    const res = await request(errApp).get("/test-next");

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      fallback: true,
      message: "Something else failed",
    });
  });
});
