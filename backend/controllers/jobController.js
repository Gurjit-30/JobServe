const Job = require('../models/job');

//we are importing the job model from the models folder and we are using it to perform CRUD operations on the job collection in the database
exports.addJob = async (req, res) => {
    try {//if we able to save data into db
        //data is store in req

        const job = new Job({
            ...req.body,
            userId: req.userId
        });

        await job.save();
        //will make sure that we proceed next until our data is stored in db
        res.json(job);


    }
    catch (err) {
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
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted" });
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.updJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(job);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
