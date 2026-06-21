const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"]
  },
  description: {
    type: String,
    required: true
  },
  constraints: [{
    type: String
  }],
  baseCodeTemplates: {
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
    javascript: { type: String, default: "" }
  },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("Problem", problemSchema);
