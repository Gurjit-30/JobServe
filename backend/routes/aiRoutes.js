const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeResume, generateCoverLetter } = require("../controllers/aiController");
const auth = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", auth, upload.single("resume"), analyzeResume);
router.post("/cover-letter", auth, generateCoverLetter);

module.exports = router;
