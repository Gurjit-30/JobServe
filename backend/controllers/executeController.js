const axios = require("axios");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.connect().catch(() => {});

const LANGUAGE_IDS = {
  python: 71,
  java: 62,
  cpp: 54,
  javascript: 63
};

const JUDGE0_BASE_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }
  return headers;
}

const b64encode = (str) => Buffer.from(str || "").toString("base64");
const b64decode = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

exports.executeCode = async (req, res) => {
  try {
    const { language, code, problemId } = req.body;
    
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ error: "Unsupported language." });
    }
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }
    
    const headers = buildHeaders();
    const testCases = problem.testCases;
    
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
      } catch (e) {}

      if (!judgeResult) {
        let submissionPayload = {
          language_id: languageId,
          source_code: b64encode(code),
          stdin: b64encode(currentTest.input),
          expected_output: b64encode(currentTest.expectedOutput),
          cpu_time_limit: 2,
          memory_limit: 128000
        };

        let sendRes = await axios.post(
          `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`,
          submissionPayload,
          { headers, timeout: 15000 }
        );

        let token = sendRes.data?.token;
        if (!token) throw new Error("No token returned");

        for (let attempt = 0; attempt < 15; attempt++) {
          await sleep(1000);
          let checkRes = await axios.get(
            `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=status,compile_output,stdout,stderr`,
            { headers, timeout: 10000 }
          );

          let statusId = checkRes.data?.status?.id;
          if (statusId === 1 || statusId === 2) continue;

          judgeResult = checkRes.data;
          break;
        }

        if (judgeResult && redisClient.isReady) {
          try {
            await redisClient.setEx(cacheKey, 86400, JSON.stringify(judgeResult));
          } catch (e) {}
        }
      }

      if (!judgeResult) {
        return res.status(504).json({ verdict: "Time Limit Exceeded" });
      }

      let finalStatusId = judgeResult.status?.id;

      if (finalStatusId === 6) {
        return res.json({ verdict: "Compilation Error", details: b64decode(judgeResult.compile_output) });
      }
      if (finalStatusId === 5) {
        return res.json({ verdict: "Time Limit Exceeded", testCaseIndex: i + 1 });
      }
      if (finalStatusId >= 7 && finalStatusId <= 12) {
        return res.json({ verdict: "Runtime Error", details: b64decode(judgeResult.stderr) });
      }
      if (finalStatusId === 4) {
        return res.json({ 
          verdict: "Wrong Answer", 
          testCaseIndex: i + 1,
          actualOutput: b64decode(judgeResult.stdout)
        });
      }
      if (finalStatusId !== 3) {
        return res.json({ verdict: "Error", details: judgeResult.status?.description });
      }
    }

    try {
      if (req.userId) {
        await Submission.create({
          user: req.userId,
          language,
          code,
          status: "Accepted",
          runtime: "N/A",
          memory: 0
        });
      }
    } catch (e) {}

    return res.json({ verdict: "Accepted", message: "All test cases passed!" });

  } catch (error) {
    return res.status(500).json({ error: "Execution error" });
  }
};
