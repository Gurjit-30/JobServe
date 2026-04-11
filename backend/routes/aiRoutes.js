const express = require("express");
const router = express.Router();
const multer = require("multer");
const aiController = require("../controllers/aiController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("resume"), aiController.analyzeResume);

module.exports = router;
