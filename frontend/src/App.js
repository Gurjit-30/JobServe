import React, { useEffect, useState, useCallback } from "react";
import api from "./api";
import { Toaster, toast } from "react-hot-toast";
import JobForm from "./component/JobForm";
import JobList from "./component/JobList";
import Login from "./component/Login";
import ResumeAnalyzer from "./component/ResumeAnalyzer";
import AnimatedBackground from "./component/AnimatedBackground";

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

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
    a.download = "JobServe_Pipeline.csv";
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
    <div className="app-bg text-gray-100">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151'
        }
      }} />
      <AnimatedBackground />
      {/* NAVBAR */}
      <nav className="navbar-glass p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">JobServe</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700/50 shadow-inner">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-gray-900">
                    {user.email[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-300">{user.name || user.email.split('@')[0]}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto mt-8 p-4 flex flex-col gap-8 relative z-10">

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="glass-card p-4 rounded-xl flex border-l-4 border-l-gray-400 flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-200">{stats.total}</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex border-l-4 border-l-emerald-400 flex-col items-center justify-center">
            <span className="text-3xl font-black text-emerald-400">{stats.applied}</span>
            <span className="text-xs text-emerald-500/80 font-bold uppercase tracking-wider">Applied</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex border-l-4 border-l-yellow-400 flex-col items-center justify-center">
            <span className="text-3xl font-black text-yellow-400">{stats.interview}</span>
            <span className="text-xs text-yellow-500/80 font-bold uppercase tracking-wider">Interviews</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex border-l-4 border-l-red-400 flex-col items-center justify-center">
            <span className="text-3xl font-black text-red-500">{stats.rejected}</span>
            <span className="text-xs text-red-500/80 font-bold uppercase tracking-wider">Rejected</span>
          </div>
        </div>

        {/* Tracker Section */}
        <div className="glass-card gradient-border p-6 md:p-8 flex flex-col gap-6 animate-fade-in-scale">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-200">Job Applications</h2>
              <p className="text-sm text-gray-500">Track and manage your applied roles.</p>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
              <button 
                onClick={exportToCSV}
                className="text-xs font-bold text-gray-400 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/50 bg-gray-800 px-3 py-2 rounded-lg transition-all"
              >
                Export CSV
              </button>
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="input-dark px-4 py-2 text-sm w-full md:w-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="input-dark px-4 py-2 text-sm"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Jobs</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <JobForm fetchJobs={fetchJobs} token={token} />

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

      </main>
    </div>
  );
}

export default App;