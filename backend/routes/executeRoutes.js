const express = require("express");
const { executeCode } = require("../controllers/executeController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, executeCode);

module.exports = router;
