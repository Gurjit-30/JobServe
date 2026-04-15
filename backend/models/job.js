const mongoose = require('mongoose');

const jobschema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Rejected'],
        default: 'Applied'
    },
    notes: String,
    jobUrl: String,
    appliedAt: { type: Date, default: Date.now },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model('job', jobschema);