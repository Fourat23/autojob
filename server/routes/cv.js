const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const auth = require("../middlewares/verifyToken");
const cvController = require("../controllers/cvController");

// Route: POST /api/upload-cv
// Description: Upload a new CV (PDF only), replacing any previous version.
// Access: Protected (JWT required)
router.post("/upload-cv", auth, upload.single("cv"), cvController.uploadCV);

module.exports = router;
