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
const Submission = require("../models/Submission");
const User = require("../models/User");
const redis = require("redis");

// Initialize Redis Client for Judge0 API Caching
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.on("error", (err) => console.log("Redis Client Error (caching disabled):", err));
redisClient.connect().catch(() => console.log("Failed to connect to Redis. Running without cache."));

// ── Judge0 language map ────────────────────────────────────────────────────
const LANGUAGE_IDS = {
  python:     71,
  java:       62,
  cpp:        54,
  javascript: 63,   // Node.js 12.14.0
  typescript: 74,   // TypeScript 3.7.4
};

// ── Mock Database for Problems ───────────────────────────────────────────────
// In a real app, you'd pull these from your MongoDB.
const MOCK_PROBLEMS = {
  "two-sum": [
    { input: "2\n3", expectedOutput: "5\n" },
    { input: "10\n20", expectedOutput: "30\n" },
    { input: "-5\n5", expectedOutput: "0\n" }
  ],
  "reverse-string": [
    { input: "hello", expectedOutput: "olleh\n" },
    { input: "world", expectedOutput: "dlrow\n" }
  ]
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
    const responseData = {
      stdout:          b64decode(result.stdout),
      stderr:          b64decode(result.stderr),
      compile_output:  b64decode(result.compile_output),
      status:          result.status,       // { id, description }
      time:            result.time,         // seconds (string)
      memory:          result.memory,       // KB (number)
    };

    try {
      await Submission.create({
        user: req.userId,
        language,
        code,
        status: result.status ? result.status.description : "Unknown",
        runtime: result.time,
        memory: result.memory
      });
    } catch (dbErr) {
      console.error("Failed to save submission:", dbErr);
    }

    return res.json(responseData);
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

// ── Submit Code (Run against hidden test cases) ──────────────────────────────
exports.submitCode = async (req, res) => {
  try {
    const { language = "python", code = "", problemId } = req.body;

    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ error: `Language not supported: ${language}` });
    }

    if (!problemId || !MOCK_PROBLEMS[problemId]) {
      return res.status(404).json({ error: "Problem not found. Please send a valid problemId." });
    }

    const testCases = MOCK_PROBLEMS[problemId];
    const headers = buildHeaders();

    // Loop through each test case sequentially
    for (let i = 0; i < testCases.length; i++) {
      let currentTest = testCases[i];
      let judgeResult = null;
      
      const cacheKey = `judge0:${languageId}:${b64encode(code)}:${b64encode(currentTest.input)}`;
      
      try {
        if (redisClient.isReady) {
          const cachedResult = await redisClient.get(cacheKey);
          if (cachedResult) {
            judgeResult = JSON.parse(cachedResult);
          }
        }
      } catch (cacheErr) {
        console.error("Redis Cache error:", cacheErr);
      }

      if (!judgeResult) {
        let submissionPayload = {
          language_id: languageId,
          source_code: b64encode(code),
          stdin: b64encode(currentTest.input),
          expected_output: b64encode(currentTest.expectedOutput),
          cpu_time_limit: 2, 
          memory_limit: 128000,
        };

        // 1. Send the submission to Judge0
        let sendRes = await axios.post(
          `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`,
          submissionPayload,
          { headers, timeout: 15000 }
        );

        let token = sendRes.data?.token;
        if (!token) {
          throw new Error("No token returned from Judge0.");
        }

        // 2. Poll Judge0 until it's done processing
        let maxAttempts = 15;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await sleep(1000); // Give it a second to think
          
          let checkRes = await axios.get(
            `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=status,compile_output,stdout,stderr`,
            { headers, timeout: 10000 }
          );

          let statusId = checkRes.data?.status?.id;
          
          // 1 = In Queue, 2 = Processing
          if (statusId === 1 || statusId === 2) {
            continue; 
          }

          judgeResult = checkRes.data;
          break;
        }

        if (judgeResult && redisClient.isReady) {
          // Cache the result for 24 hours
          try {
            await redisClient.setEx(cacheKey, 86400, JSON.stringify(judgeResult));
          } catch (setErr) {
             console.error("Redis Set Error:", setErr);
          }
        }
      }

      // If we never got an answer...
      if (!judgeResult) {
        return res.status(504).json({ verdict: "Time Limit Exceeded", details: "Execution took too long." });
      }

      let finalStatusId = judgeResult.status?.id;

      // Handle common bad outcomes
      if (finalStatusId === 6) {
        await Submission.create({ user: req.userId, language, code, status: "Compilation Error" }).catch(console.error);
        return res.json({ verdict: "Compilation Error", details: b64decode(judgeResult.compile_output) });
      }
      
      if (finalStatusId === 5) {
        await Submission.create({ user: req.userId, language, code, status: "Time Limit Exceeded" }).catch(console.error);
        return res.json({ verdict: "Time Limit Exceeded", testCaseIndex: i + 1 });
      }
      
      if (finalStatusId >= 7 && finalStatusId <= 12) {
        await Submission.create({ user: req.userId, language, code, status: "Runtime Error" }).catch(console.error);
        return res.json({ verdict: "Runtime Error", details: b64decode(judgeResult.stderr) });
      }

      if (finalStatusId === 4) {
        await Submission.create({ user: req.userId, language, code, status: "Wrong Answer" }).catch(console.error);
        return res.json({ 
          verdict: "Wrong Answer", 
          testCaseIndex: i + 1, 
          failedInput: currentTest.input,
          expected: currentTest.expectedOutput,
          actualOutput: b64decode(judgeResult.stdout)
        });
      }

      // If it's something weird, just say error
      if (finalStatusId !== 3) {
        return res.json({ verdict: "Error", details: judgeResult.status?.description });
      }
      
      // If finalStatusId === 3, this test case passed!
      // We just move on to the next iteration.
    }

    // If we finished the loop without returning, all test cases were a success!
    try {
      await Submission.create({
        user: req.userId,
        language,
        code,
        status: "Accepted",
        runtime: "N/A",
        memory: 0
      });

      // Award points if the user hasn't solved this challenge yet
      const user = await User.findById(req.userId);
      if (user && !user.completedChallenges.includes(problemId)) {
        user.completedChallenges.push(problemId);
        user.score = (user.score || 0) + 100;
        await user.save();
      }
    } catch (dbErr) {
      console.error("Failed to save submission or update user score:", dbErr);
    }

    return res.json({ verdict: "Accepted", message: "All test cases passed! Great job." });

  } catch (error) {
    console.error("Oops, submitCode encountered an error:", error.message);
    return res.status(500).json({ error: "Something went wrong while evaluating your code." });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50);
    return res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ error: "Failed to fetch submissions." });
  }
};
