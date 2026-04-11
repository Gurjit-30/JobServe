const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  name:     { type: String },
  avatar:   { type: String },
  provider: { type: String, default: "local" }, // "local" | "google" | "linkedin"
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);