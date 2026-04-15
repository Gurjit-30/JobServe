import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import JobForm from "./component/JobForm";
import JobList from "./component/JobList";
import Login from "./component/Login";
import ResumeAnalyzer from "./component/ResumeAnalyzer";

const API = process.env.REACT_APP_API_URL;

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/jobs`, {
        headers: { Authorization: token }
      });
      setJobs(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const filteredJobs = filter === "All"
    ? jobs
    : jobs.filter((job) => job.status === filter);

  return (
    <div className="app-bg text-gray-100">
      {/* NAVBAR */}
      <nav className="navbar-glass p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">JobServe</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto mt-8 p-4 flex flex-col gap-8 relative z-10">

        {/* Tracker Section */}
        <div className="glass-card gradient-border p-6 md:p-8 flex flex-col gap-6 animate-fade-in-scale">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-200">Job Applications</h2>
              <p className="text-sm text-gray-500">Track and manage your applied roles.</p>
            </div>

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