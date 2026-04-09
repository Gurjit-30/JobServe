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
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Smart Placement Tracker</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken(null);
          }}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded shadow">

        <JobForm fetchJobs={fetchJobs} token={token} />

        <select
          className="mt-4 p-2 border w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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