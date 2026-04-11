import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function JobForm({ fetchJobs, token }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${API}/jobs/add`, {
      company,
      role,
    }, {
      headers: { Authorization: token }
    });

    setCompany("");
    setRole("");
    fetchJobs();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        className="w-full sm:flex-[2] text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        className="w-full sm:flex-[2] text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        type="text"
        placeholder="Job Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <button className="sm:flex-[1] font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Job
      </button>
    </form>
  );
}

export default JobForm;






