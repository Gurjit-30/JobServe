const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  name:     { type: String },
  avatar:   { type: String },
  provider: { type: String, default: "local" }, // "local" | "google" | "linkedin"
  score:    { type: Number, default: 0 },
  completedChallenges: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);