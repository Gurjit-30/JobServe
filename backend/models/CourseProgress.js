const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  watchedLessons: [{ type: mongoose.Schema.Types.ObjectId }] // Array of lesson IDs
}, { timestamps: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
