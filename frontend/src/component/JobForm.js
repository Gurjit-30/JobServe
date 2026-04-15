import React, { useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";

function JobForm({ fetchJobs }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/add`, { company, role, jobUrl });
      setCompany("");
      setRole("");
      setJobUrl("");
      toast.success("Job added!");
      fetchJobs();
    } catch(err) {
      toast.error("Failed to add job.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        className="w-full sm:w-1/3 text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        type="text"
        placeholder="Company Name"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        className="w-full sm:w-1/3 text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        type="text"
        placeholder="Job Role"
        required
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <input
        className="w-full sm:w-1/3 text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        type="url"
        placeholder="Job Post URL (optional)"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
      />
      <button className="sm:w-32 font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add
      </button>
    </form>
  );
}

export default JobForm;






