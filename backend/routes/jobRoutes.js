const express = require("express");
const router = express.Router();
const { addJob,getJob,delJob,updJob } = require("../controllers/jobController");
const auth = require("../middleware/auth");

router.post("/add", auth, addJob);
router.get("/", auth, getJob);
router.delete("/:id", auth, delJob);
router.put("/:id", auth, updJob);

module.exports = router;