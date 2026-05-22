/**
 * codeRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes for sandboxed code execution via Judge0 CE.
 *
 * POST /run-code
 *   Body: { language: "python"|"java"|"cpp", code: string, stdin?: string }
 */

const express    = require("express");
const rateLimit  = require("express-rate-limit");
const { runCode, submitCode, getSubmissions } = require("../controllers/codeController");
const auth = require("../middleware/auth");

const router = express.Router();

// ── Rate limiter: 20 executions per 10 minutes per IP ─────────────────────
// Judge0 public CE is shared — be respectful of the free tier.
const codeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: {
    error: "Too many code executions. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// POST /run-code
router.post("/", auth, codeLimiter, runCode);

// POST /run-code/submit
router.post("/submit", auth, codeLimiter, submitCode);

// GET /run-code/submissions
router.get("/submissions", auth, getSubmissions);

module.exports = router;
