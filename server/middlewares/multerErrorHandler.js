const multer = require("multer");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("Only PDF")) {
    // Custom error handling for invalid file type, size, etc.
    return res
      .status(400)
      .json({ error: "Invalid file type. Only PDF allowed." });
  }

  // Pass to global error handler if not multer
  next(err);
};

module.exports = multerErrorHandler;
