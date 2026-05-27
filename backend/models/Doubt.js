const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isMentor: { type: Boolean, default: false }
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  replies: [replySchema]
}, { timestamps: true });

module.exports = mongoose.model("Doubt", doubtSchema);
