const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("../config/passport");

// ── Email / Password ──────────────────────────────────────────────────────────
router.post("/register", authController.register);
router.post("/login", authController.login);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}?auth_error=true`,
  }),
  authController.oauthCallback
);

module.exports = router;