const express = require("express");
const Problem = require("../models/Problem");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find({}, "-testCases");
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

module.exports = router;
