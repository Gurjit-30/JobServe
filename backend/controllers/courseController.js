const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Doubt = require("../models/Doubt");

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();
    res.json(allCourses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const courseDetails = await Course.findById(req.params.courseId);
    if (!courseDetails) return res.status(404).json({ error: "Course not found" });
    res.json(courseDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course details" });
  }
};

exports.markLessonWatched = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.userId;

    let userProgress = await CourseProgress.findOne({ studentId, courseId });
    if (!userProgress) {
      userProgress = new CourseProgress({ studentId, courseId, watchedLessons: [] });
    }

    if (!userProgress.watchedLessons.includes(lessonId)) {
      userProgress.watchedLessons.push(lessonId);
      await userProgress.save();
    }

    res.json({ message: "Lesson marked as watched", progress: userProgress });
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;
    
    const userProgress = await CourseProgress.findOne({ studentId, courseId });
    res.json({ watchedLessons: userProgress ? userProgress.watchedLessons : [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

exports.getDoubtsForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const doubts = await Doubt.find({ lessonId }).populate('studentId', 'name avatar').populate('replies.authorId', 'name avatar');
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doubts" });
  }
};

exports.postDoubt = async (req, res) => {
  try {
    const { lessonId, text } = req.body;
    const studentId = req.userId;
    const newDoubt = new Doubt({ lessonId, studentId, text });
    await newDoubt.save();
    res.json({ message: "Doubt posted", doubt: newDoubt });
  } catch (error) {
    res.status(500).json({ error: "Failed to post doubt" });
  }
};

exports.replyToDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { text, isMentor } = req.body;
    const authorId = req.userId;

    const doubtToUpdate = await Doubt.findById(doubtId);
    if (!doubtToUpdate) return res.status(404).json({ error: "Doubt not found" });

    doubtToUpdate.replies.push({ authorId, text, isMentor });
    await doubtToUpdate.save();

    res.json({ message: "Reply added", doubt: doubtToUpdate });
  } catch (error) {
    res.status(500).json({ error: "Failed to reply to doubt" });
  }
};

exports.resolveDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const doubtToResolve = await Doubt.findByIdAndUpdate(doubtId, { isResolved: true }, { new: true });
    res.json({ message: "Doubt resolved", doubt: doubtToResolve });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve doubt" });
  }
};
