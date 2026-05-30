import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/user/profile")
      .then(res => {
        setProfileData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-transparent text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#00e5a0] border-t-transparent animate-spin"></div>
          <p className="text-[#8b949e] text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <svg className="w-12 h-12 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-white font-semibold">Failed to load profile</p>
        <p className="text-[#8b949e] text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  const { user, stats, recommendedVideos } = profileData;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">

      {/* ── Profile Header Card ── */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
        {/* Subtle teal glow in the background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00e5a0]/5 via-transparent to-transparent pointer-events-none" />

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#00e5a0] flex items-center justify-center text-3xl font-bold text-[#0d1117] shrink-0 shadow-[0_0_24px_rgba(0,229,160,0.25)] relative z-10">
          {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            {user.name || user.email.split('@')[0]}
          </h1>
          <p className="text-[#8b949e] text-sm mb-3">{user.email}</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              Active Member
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              Verified
            </span>
          </div>
        </div>

        {/* Readiness Score Ring */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="w-20 h-20 relative flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 absolute" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#21262d" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="#00e5a0"
                strokeWidth="2.5"
                strokeDasharray={`${stats?.readinessScore || 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-lg font-bold text-white relative z-10">{stats?.readinessScore || 0}%</span>
          </div>
          <span className="text-xs text-[#8b949e] font-medium text-center">Readiness</span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 border-t-2 border-t-[#00e5a0] hover:border-[#00e5a0]/40 transition-all duration-200">
          <svg className="w-6 h-6 text-[#00e5a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-4xl font-black text-white">{stats?.problemsSolvedCount ?? 0}</span>
          <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Problems Solved</span>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 border-t-2 border-t-[#f59e0b] hover:border-[#f59e0b]/40 transition-all duration-200">
          <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-4xl font-black text-[#f59e0b]">{stats?.coursesCompletedCount ?? 0}</span>
          <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Courses Completed</span>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 border-t-2 border-t-[#3b82f6] hover:border-[#3b82f6]/40 transition-all duration-200">
          <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="text-4xl font-black text-[#3b82f6]">{stats?.interviewsCount ?? 0}</span>
          <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Interviews Done</span>
        </div>
      </div>

      {/* ── Smart Recommendations ── */}
      {recommendedVideos && recommendedVideos.length > 0 && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-[#00e5a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Smart Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedVideos.map((rec, i) => (
              <div key={i} className="bg-[#0d1117] border border-[#21262d] hover:border-[#00e5a0]/30 rounded-xl p-5 transition-all duration-200 group">
                <div className="text-xs text-[#00e5a0] mb-2 font-semibold bg-[#00e5a0]/10 inline-block px-2 py-1 rounded-md">
                  {rec.courseTitle}
                </div>
                <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#00e5a0] transition-colors">{rec.lessonTitle}</h4>
                <p className="text-[#8b949e] text-sm mb-4 line-clamp-2">{rec.reason}</p>
                <Link
                  to={`/courses/${rec.courseId}`}
                  className="text-sm text-[#00e5a0] hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
                >
                  Watch Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
