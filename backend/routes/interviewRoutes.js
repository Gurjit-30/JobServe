const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/auth");

router.post("/start", authMiddleware, interviewController.startInterview);
router.post("/:interviewId/answer", authMiddleware, interviewController.submitAnswerAndGetNextQuestion);
router.post("/:interviewId/complete", authMiddleware, interviewController.completeInterview);
router.get("/:interviewId/report", authMiddleware, interviewController.getInterviewReport);

module.exports = router;
