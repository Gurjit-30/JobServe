const Job = require('../models/job');

exports.addJob = async (req, res) => {
    try {
        const { company, role, status, notes, jobUrl } = req.body;
        const job = new Job({
            company,
            role,
            status,
            notes,
            jobUrl,
            userId: req.userId
        });
        await job.save();
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getJob = async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.userId });
        res.json(jobs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.delJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
        res.json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updJob = async (req, res) => {
    try {
        const { company, role, status, notes, jobUrl } = req.body;
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId }, 
            { company, role, status, notes, jobUrl }, 
            { new: true }
        );
        if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
