const express = require("express");
const { getDailyChallenge } = require("../controllers/challengeController");

const router = express.Router();

router.get("/daily", getDailyChallenge);

module.exports = router;
