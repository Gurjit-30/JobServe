const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  timestampInSeconds: { type: Number, required: true },
  question: quizQuestionSchema
});

const lessonResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'github', 'link'], default: 'link' }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  durationInMinutes: { type: Number },
  quizzes: [quizSchema],
  resources: [lessonResourceSchema]
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thumbnailUrl: { type: String },
  modules: [moduleSchema]
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
