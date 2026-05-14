/**
 * codeController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles POST /run-code
 *
 * Strategy
 *   1. Accept { language, code, stdin } from the client
 *   2. Submit a submission to Judge0 CE (public saar.a.judge0.com endpoint)
 *   3. Poll until the submission is no longer "In Queue" / "Processing"
 *   4. Return { stdout, stderr, compile_output, status, time, memory }
 *
 * Judge0 language IDs used:
 *   Python 3  → 71
 *   Java      → 62
 *   C++ (g++) → 54
 */

const axios = require("axios");

// ── Judge0 language map ────────────────────────────────────────────────────
const LANGUAGE_IDS = {
  python:     71,
  java:       62,
  cpp:        54,
  javascript: 63,   // Node.js 12.14.0
  typescript: 74,   // TypeScript 3.7.4
};

// ── Judge0 endpoint — public CE instance (rate-limited at 100 req/day) ────
// Override with JUDGE0_API_URL + JUDGE0_API_KEY in .env for a private host.
const JUDGE0_BASE_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";

// Build headers for RapidAPI gateway (falls back to unauthenticated CE host)
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"]  = process.env.JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }
  return headers;
}

// ── Helper: base64 encode/decode (Judge0 requires base64 source/IO) ────────
const b64encode = (str) => Buffer.from(str || "").toString("base64");
const b64decode = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

// ── Helper: sleep ──────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Main controller ────────────────────────────────────────────────────────
exports.runCode = async (req, res) => {
  try {
    const { language = "python", code = "", stdin = "" } = req.body;

    // Validate language
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({
        error: `Unsupported language "${language}". Choose from: ${Object.keys(LANGUAGE_IDS).join(", ")}.`,
      });
    }

    // Validate code length (prevent abuse — 50 KB max)
    if (code.length > 50_000) {
      return res.status(400).json({ error: "Code exceeds 50 KB limit." });
    }

    const headers = buildHeaders();

    // ── Step 1: Submit submission ─────────────────────────────────────────
    const submitRes = await axios.post(
      `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`,
      {
        language_id:       languageId,
        source_code:       b64encode(code),
        stdin:             b64encode(stdin),
        cpu_time_limit:    10,   // seconds
        memory_limit:      131072, // 128 MB in KB
      },
      { headers, timeout: 15_000 }
    );

    const token = submitRes.data?.token;
    if (!token) {
      throw new Error("Judge0 did not return a submission token.");
    }

    // ── Step 2: Poll for result ───────────────────────────────────────────
    let result = null;
    const MAX_POLLS   = 15;
    const POLL_DELAY  = 1200; // ms between polls

    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_DELAY);

      const pollRes = await axios.get(
        `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
        { headers, timeout: 10_000 }
      );

      const data = pollRes.data;
      const statusId = data?.status?.id;

      // Status IDs: 1 = In Queue, 2 = Processing — keep polling
      if (statusId === 1 || statusId === 2) continue;

      result = data;
      break;
    }

    if (!result) {
      return res.status(504).json({ error: "Execution timed out. Please try a smaller program." });
    }

    // ── Step 3: Decode and return ─────────────────────────────────────────
    return res.json({
      stdout:          b64decode(result.stdout),
      stderr:          b64decode(result.stderr),
      compile_output:  b64decode(result.compile_output),
      status:          result.status,       // { id, description }
      time:            result.time,         // seconds (string)
      memory:          result.memory,       // KB (number)
    });
  } catch (err) {
    // Surface Judge0 error body if available
    const judgeMsg = err.response?.data?.error || err.response?.data?.message;
    console.error("[codeController] error:", judgeMsg || err.message);

    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "Judge0 service is unreachable. Try again later." });
    }

    return res.status(500).json({
      error: judgeMsg || "Internal server error during code execution.",
    });
  }
};
