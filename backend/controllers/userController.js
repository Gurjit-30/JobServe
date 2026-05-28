const User = require("../models/User");
const Submission = require("../models/Submission");
const CourseProgress = require("../models/CourseProgress");
const Interview = require("../models/Interview");
const Course = require("../models/Course");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Problems Solved (LeetCode style)
    const submissions = await Submission.find({ user: req.userId, status: "Accepted" }).distinct("code");
    // alternatively, rely on user.completedChallenges.length
    const problemsSolvedCount = user.completedChallenges ? user.completedChallenges.length : 0;
    
    const allSubmissions = await Submission.find({ user: req.userId }).sort({ createdAt: -1 }).limit(20);

    // 2. Courses Completed (CipherSchool style)
    const coursesProgress = await CourseProgress.find({ studentId: req.userId }).populate("courseId");
    let coursesCompletedCount = 0;
    const coursesInProgress = [];

    for (const progress of coursesProgress) {
      if (progress.courseId) {
        // compute total lessons
        let totalLessons = 0;
        progress.courseId.modules.forEach(m => {
          totalLessons += m.lessons.length;
        });

        if (totalLessons > 0 && progress.watchedLessons.length === totalLessons) {
          coursesCompletedCount++;
        } else {
          coursesInProgress.push({
            course: progress.courseId,
            progressPercentage: totalLessons ? Math.round((progress.watchedLessons.length / totalLessons) * 100) : 0
          });
        }
      }
    }

    // 3. Smart Recommendations
    const latestInterview = await Interview.findOne({ candidateId: req.userId, status: "completed" }).sort({ createdAt: -1 });
    let recommendedVideos = [];

    if (latestInterview && latestInterview.failedTopics && latestInterview.failedTopics.length > 0) {
      // Find course videos matching these topics (naive text search for prototype)
      for (const topic of latestInterview.failedTopics) {
        const courses = await Course.find({
          "modules.lessons.title": { $regex: topic, $options: "i" }
        }).limit(2);
        
        courses.forEach(course => {
          course.modules.forEach(mod => {
            mod.lessons.forEach(lesson => {
              if (lesson.title.toLowerCase().includes(topic.toLowerCase())) {
                recommendedVideos.push({
                  courseId: course._id,
                  courseTitle: course.title,
                  lessonTitle: lesson.title,
                  videoUrl: lesson.videoUrl,
                  reason: `Because you struggled with ${topic} in your last interview`
                });
              }
            });
          });
        });
      }
    }

    res.json({
      user,
      stats: {
        problemsSolvedCount,
        coursesCompletedCount,
        readinessScore: user.readinessScore || 0
      },
      recentSubmissions: allSubmissions,
      coursesInProgress,
      recommendedVideos: recommendedVideos.slice(0, 3) // max 3 recommendations
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
