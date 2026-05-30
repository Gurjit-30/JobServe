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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 bg-[#161b22] border border-[#21262d] rounded-xl p-4">
      <input
        className="w-full sm:w-1/3 h-10 text-sm px-3 bg-[#0d1117] border border-[#21262d] rounded-lg text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-all"
        type="text"
        placeholder="Company Name"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        className="w-full sm:w-1/3 h-10 text-sm px-3 bg-[#0d1117] border border-[#21262d] rounded-lg text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-all"
        type="text"
        placeholder="Job Role"
        required
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <input
        className="w-full sm:w-1/3 h-10 text-sm px-3 bg-[#0d1117] border border-[#21262d] rounded-lg text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-all"
        type="url"
        placeholder="Job Post URL (optional)"
        value={jobUrl}
        onChange={(e) => setJobUrl(e.target.value)}
      />
      <button className="sm:w-32 h-10 font-bold px-4 rounded-lg flex items-center justify-center gap-1 bg-[#00e5a0] hover:bg-[#00c58a] text-[#0d1117] shadow-[0_0_12px_rgba(0,229,160,0.2)] focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-all duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add
      </button>
    </form>
  );
}

export default JobForm;






