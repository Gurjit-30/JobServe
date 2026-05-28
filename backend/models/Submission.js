const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
  },
  memory: {
    type: Number,
  },
}, { timestamps: true });

submissionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
