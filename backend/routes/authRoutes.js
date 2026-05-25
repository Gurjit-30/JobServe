const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("../config/passport");

// ── Email / Password ──────────────────────────────────────────────────────────
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", require("../middleware/auth"), authController.getMe);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Google OAuth Error:", err);
        const clientUrl = process.env.CLIENT_URL || "";
        const errorMessage = err.message || "Unknown error";
        return res.redirect(`${clientUrl}/?auth_error=true&error_details=${encodeURIComponent(errorMessage)}`);
      }
      if (!user) {
        const clientUrl = process.env.CLIENT_URL || "";
        return res.redirect(`${clientUrl}/?auth_error=true`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  authController.oauthCallback
);

module.exports = router;