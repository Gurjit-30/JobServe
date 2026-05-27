const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/auth");

router.get("/", courseController.getAllCourses);
router.get("/:courseId", courseController.getCourseById);

router.post("/progress", authMiddleware, courseController.markLessonWatched);
router.get("/progress/:courseId", authMiddleware, courseController.getCourseProgress);

router.get("/doubts/:lessonId", courseController.getDoubtsForLesson);
router.post("/doubts", authMiddleware, courseController.postDoubt);
router.post("/doubts/:doubtId/reply", authMiddleware, courseController.replyToDoubt);
router.put("/doubts/:doubtId/resolve", authMiddleware, courseController.resolveDoubt);

module.exports = router;
