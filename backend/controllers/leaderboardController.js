const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch top 50 users sorted by score descending
    const leaderboard = await User.find({})
      .sort({ score: -1 })
      .limit(50)
      .select("name email avatar score"); // Only send public-safe fields

    return res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
