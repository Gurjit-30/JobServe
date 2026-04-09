import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import JobForm from "./component/JobForm";
import JobList from "./component/JobList";
import Login from "./component/Login";

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
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl font-bold text-center mb-5">
        Smart Placement Tracker
      </h1>

      <div className="max-w-xl mx-auto bg-white p-5 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Jobs</h2>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => { localStorage.removeItem("token"); setToken(null); }}
          >
            Logout
          </button>
        </div>

        <JobForm fetchJobs={fetchJobs} token={token} />

        <select
          className="mt-3 p-2 border w-full"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
        </select>

        <JobList jobs={filteredJobs} fetchJobs={fetchJobs} token={token} />
      </div>
    </div>
  );
}

export default App;