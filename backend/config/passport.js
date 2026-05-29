const passport = require("passport");
// ── No Passport Strategies Currently Configured ─────────────────────────────────

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
