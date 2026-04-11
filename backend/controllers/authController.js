const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashed, provider: "local" });
    await user.save();

    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    // Prevent OAuth users from logging in with password
    if (user.provider && user.provider !== "local") {
      return res.status(400).json({
        message: `This email is linked to ${user.provider} login. Use that instead.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Called after OAuth success — redirects user to frontend with JWT in URL
exports.oauthCallback = (req, res) => {
  const token = req.user?.token;
  if (!token) return res.redirect(`${process.env.CLIENT_URL}?auth_error=true`);
  res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
};