import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import JobForm from "./component/JobForm";
import JobList from "./component/JobList";
import Login from "./component/Login";
import ResumeAnalyzer from "./component/ResumeAnalyzer";
function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");  // ← already have this
  const [token, setToken] = useState(localStorage.getItem("token"));

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("https://jobserve-hghp.onrender.com/jobs", {
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

  if (!token) {
    return <Login setToken={setToken} />;
  }

  // ← ADD THIS
  const filteredJobs = filter === "All"
    ? jobs
    : jobs.filter((job) => job.status === filter);


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      {/* NAVBAR */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">JobServe</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto mt-8 p-4 flex flex-col gap-8">
        
        {/* Tracker Section Wrapper */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-200">Job Applications</h2>
              <p className="text-sm text-gray-500">Track and manage your applied roles.</p>
            </div>
            
            <select
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
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
             <div className="text-center py-10 text-gray-600 border border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <p>No jobs found in this category.</p>
             </div>
          )}
        </div>

        {/* AI Resume Analyzer Component handles its own styling & dark card */}
        <ResumeAnalyzer />

      </main>
    </div>
  );
}

export default App;