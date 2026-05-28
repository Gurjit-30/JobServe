const mongoose = require("mongoose");

const interviewInteractionSchema = new mongoose.Schema({
  interviewerQuestion: { type: String, required: true },
  candidateAnswerTranscript: { type: String, required: true },
  aiFeedbackStarMethod: { type: String }, // AI's evaluation using STAR method
  technicalScore: { type: Number, min: 0, max: 10 },
  communicationScore: { type: Number, min: 0, max: 10 },
  emotionsDetected: {
    confidenceLevel: { type: Number, min: 0, max: 100 },
    nervousnessLevel: { type: Number, min: 0, max: 100 },
    eyeContactScore: { type: Number, min: 0, max: 100 }
  }
});

const interviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyTarget: { type: String, required: true }, // e.g., "Amazon", "Google"
  roleTarget: { type: String, required: true },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  interactions: [interviewInteractionSchema],
  overallTechnicalScore: { type: Number },
  overallCommunicationScore: { type: Number },
  overallSuggestedImprovements: { type: String },
  failedTopics: [{ type: String }] // Extracted topics where candidate failed
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);
