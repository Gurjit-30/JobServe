const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("../config/passport");

// ── Email / Password ──────────────────────────────────────────────────────────
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", require("../middleware/auth"), authController.getMe);

router.post("/google", authController.googleLogin);

module.exports = router;