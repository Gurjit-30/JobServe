const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

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
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

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

exports.oauthCallback = (req, res) => {
  const token = req.user?.token;
  const clientUrl = process.env.CLIENT_URL || "";
  
  if (!token) return res.redirect(`${clientUrl}/?auth_error=true`);
  
  // Ensure we don't redirect to "undefined?token=..." if CLIENT_URL is missing
  const redirectUrl = clientUrl.endsWith("/") 
    ? `${clientUrl}?token=${token}` 
    : `${clientUrl}/?token=${token}`;
    
  res.redirect(redirectUrl);
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};