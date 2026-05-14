require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");

const jobRoutes  = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes   = require("./routes/aiRoutes");
const codeRoutes = require("./routes/codeRoutes");

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Rate Limiting (brute-force protection on auth routes) ─────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/jobs", jobRoutes);
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/run-code", codeRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Jobserv API running 🚀" }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));