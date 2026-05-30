import React, { useEffect, useState, useCallback } from "react";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";
import JobForm from "./component/JobForm";
import JobList from "./component/JobList";
import Login from "./component/Login";
import ResumeAnalyzer from "./component/ResumeAnalyzer";
import AnimatedBackground from "./component/AnimatedBackground";
import CodeEditor from "./component/CodeEditor";
import ProblemDescription from "./component/ProblemDescription";
import Leaderboard from "./component/Leaderboard";
import CourseDashboard from "./component/CourseDashboard";
import { Routes, Route, useLocation } from 'react-router-dom';
import CoursePlayer from './component/CoursePlayer/CoursePlayer';
import InterviewSetup from './component/AIInterview/InterviewSetup';
import ActiveInterview from './component/AIInterview/ActiveInterview';
import InterviewReport from './component/AIInterview/InterviewReport';
import UserProfile from './component/UserProfile';
import { useTheme } from './context/ThemeContext';
import Sidebar from './component/Sidebar';
import TopHeader from './component/TopHeader';

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const location = useLocation();
  // Theme context available via TopHeader — not used directly here
  useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);

  const triggerSubmissionRefresh = () => setSubmissionRefreshKey(prev => prev + 1);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get(`/jobs`);
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to load jobs");
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
    if (token) {
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, [fetchJobs, token]);

  // Handle OAuth redirect — token arrives from Login.js useEffect
  // but if App renders first (token already in localStorage from URL), handle here too
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Signed out");
  };

  const exportToCSV = () => {
    if (!jobs.length) return toast.error("No jobs to export!");
    const headers = "Company,Role,Status,Notes,URL,Date\n";
    const csvRows = jobs.map(j => {
      const notes = (j.notes || "").replace(/"/g, '""');
      return `"${j.company}","${j.role}","${j.status}","${notes}","${j.jobUrl || ''}","${j.appliedAt || ''}"`;
    });
    const blob = new Blob([headers + csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Prepserve_Pipeline.csv";
    a.click();
    toast.success("Export downloaded");
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filter === "All" || job.status === filter;
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "Applied").length,
    interview: jobs.filter(j => j.status === "Interview").length,
    rejected: jobs.filter(j => j.status === "Rejected").length,
  };

  return (
    <div className="app-bg text-gray-100 flex h-screen overflow-hidden">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151'
        }
      }} />
      <AnimatedBackground />
      
      {/* SIDEBAR */}
      <Sidebar user={user} handleSignOut={handleSignOut} />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <TopHeader user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className={`flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 mx-auto w-full ${location.pathname.includes('/courses') || location.pathname.includes('/interview') ? 'max-w-[90rem]' : 'max-w-6xl'}`}>
          <Routes>
            <Route path="/" element={
            <div className="flex flex-col gap-8 animate-fade-in">
              {/* Analytics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-card h-[120px] rounded-xl flex border-t-2 border-t-[#00e5a0] flex-col items-center justify-center p-6">
                  <svg className="w-5 h-5 text-[#8b949e] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-5xl font-bold text-white leading-none">{stats.total}</span>
                  <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider mt-2">Total</span>
                </div>
                <div className="glass-card h-[120px] rounded-xl flex border-t-2 border-t-[#3b82f6] flex-col items-center justify-center p-6">
                  <svg className="w-5 h-5 text-[#8b949e] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-5xl font-bold text-[#3b82f6] leading-none">{stats.applied}</span>
                  <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider mt-2">Applied</span>
                </div>
                <div className="glass-card h-[120px] rounded-xl flex border-t-2 border-t-[#f59e0b] flex-col items-center justify-center p-6">
                  <svg className="w-5 h-5 text-[#8b949e] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-5xl font-bold text-[#f59e0b] leading-none">{stats.interview}</span>
                  <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider mt-2">Interviews</span>
                </div>
                <div className="glass-card h-[120px] rounded-xl flex border-t-2 border-t-[#ef4444] flex-col items-center justify-center p-6">
                  <svg className="w-5 h-5 text-[#8b949e] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-5xl font-bold text-[#ef4444] leading-none">{stats.rejected}</span>
                  <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider mt-2">Rejected</span>
                </div>
              </div>

          {/* Tracker Section */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in-scale">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#21262d] pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-200">Job Applications</h2>
                <p className="text-sm text-[#8b949e]">Track and manage your applied roles.</p>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={exportToCSV}
                  className="h-10 text-xs font-bold text-[#8b949e] hover:text-[#00e5a0] border border-[#21262d] hover:border-[#00e5a0]/50 bg-[#161b22] px-4 rounded-lg transition-all focus-visible:ring-1 focus-visible:ring-[#00e5a0]"
                >
                  Export CSV
                </button>
                <select
                  className="input-dark h-10 px-4 text-sm border-[#21262d] focus:border-[#00e5a0]"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All Jobs</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button 
                  onClick={() => setShowJobForm(!showJobForm)}
                  className="h-10 text-xs font-bold text-[#0d1117] bg-[#00e5a0] hover:bg-[#00c58a] px-4 rounded-lg transition-all shadow-[0_0_12px_rgba(0,229,160,0.2)] focus-visible:ring-1 focus-visible:ring-[#00e5a0] flex items-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showJobForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {showJobForm ? 'Close' : 'Add Job'}
                </button>
              </div>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${showJobForm ? 'max-h-[500px] opacity-100 mb-2' : 'max-h-0 opacity-0 m-0'}`}>
              <JobForm fetchJobs={fetchJobs} token={token} />
            </div>

            {filteredJobs.length > 0 ? (
              <JobList jobs={filteredJobs} fetchJobs={fetchJobs} token={token} />
            ) : (
              <div className="text-center py-10 text-gray-600 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                <p>No jobs found in this category.</p>
              </div>
            )}
          </div>

          {/* AI Resume Ranker */}
          <ResumeAnalyzer />

          {/* Coding Assessment Section */}
          <div className="coding-assessment-container h-[600px] mb-8">
            <ProblemDescription refreshKey={submissionRefreshKey} />
            <CodeEditor onRunCode={triggerSubmissionRefresh} />
          </div>

          {/* Global Leaderboard Section */}
          <div className="h-[500px] mb-12">
            <Leaderboard />
          </div>
            </div>
            } />

            <Route path="/courses" element={<CourseDashboard />} />
            <Route path="/course/:courseId" element={<CoursePlayer />} />
            <Route path="/interview/setup" element={<InterviewSetup />} />
            <Route path="/interview/active/:interviewId" element={<ActiveInterview />} />
            <Route path="/interview/report/:interviewId" element={<InterviewReport />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;