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
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="p-8 text-white text-center">Failed to load profile.</div>;
  }

  const { user, stats, recommendedVideos } = profileData;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center space-x-6 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {user.name || "User Profile"}
            </h1>
            <p className="text-slate-400 mt-2">{user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Problems Solved</h3>
            <p className="text-5xl font-black text-emerald-400">{stats.problemsSolvedCount}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2">Courses Completed</h3>
            <p className="text-5xl font-black text-amber-400">{stats.coursesCompletedCount}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300 relative overflow-hidden">
            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-2 relative z-10">Readiness Score</h3>
            <p className="text-5xl font-black text-indigo-400 relative z-10">{stats.readinessScore}%</p>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0 pointer-events-none"></div>
          </div>
        </div>

        {/* Smart Recommendations Section */}
        {recommendedVideos && recommendedVideos.length > 0 && (
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-indigo-500/30">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-indigo-300">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Smart Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedVideos.map((rec, i) => (
                <div key={i} className="bg-slate-800 p-5 rounded-xl shadow-md border border-slate-600 hover:border-indigo-400 transition-colors">
                  <div className="text-xs text-indigo-400 mb-2 font-semibold bg-indigo-900/40 inline-block px-2 py-1 rounded">
                    {rec.courseTitle}
                  </div>
                  <h4 className="font-semibold text-lg text-slate-100 mb-2 line-clamp-2">{rec.lessonTitle}</h4>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{rec.reason}</p>
                  <Link to={`/courses/${rec.courseId}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center">
                    Watch Now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
