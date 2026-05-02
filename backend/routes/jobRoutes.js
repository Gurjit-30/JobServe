const express = require("express");
const router = express.Router();
const { addJob,getJob,delJob,updJob } = require("../controllers/jobController");

router.post("/add", addJob);
router.get("/get",getJob);
router.delete("/:id",delJob);
router.put("/:id",updJob);

module.exports = router;