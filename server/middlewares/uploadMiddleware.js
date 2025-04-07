const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ✅ Use a different folder in test mode to isolate test files
const destination =
  process.env.NODE_ENV === "test" ? "uploads/cv/test" : "uploads/cv";

// ✅ Generates a unique filename using timestamp + UUID
const filenameFn = (req, file, cb) => {
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(
    file.originalname
  )}`;
  cb(null, uniqueName);
};

// ✅ Chooses destination folder
const destinationFn = (req, file, cb) => {
  cb(null, destination);
};

// ✅ Filters only PDFs, else triggers MulterError (handled by custom error middleware)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    err.message = "Only PDF files are allowed";
    cb(err);
  }
};

// ✅ Storage engine for multer (disk-based)
const storage = multer.diskStorage({
  destination: destinationFn,
  filename: filenameFn,
});

// ✅ Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // ✅ 2MB max file size
  },
});

module.exports = upload;

// ✅ Export internal functions for testing
module.exports._test = {
  filenameFn,
  destinationFn,
  fileFilter,
};
