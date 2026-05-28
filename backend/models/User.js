const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  name:     { type: String },
  avatar:   { type: String },
  provider: { type: String, default: "local" }, // "local" | "google" | "linkedin"
  score:    { type: Number, default: 0, index: true },
  readinessScore: { type: Number, default: 0, index: true },
  completedChallenges: [{ type: String }],
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);