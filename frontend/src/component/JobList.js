import React, { useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { FiExternalLink, FiCpu, FiTrash2 } from "react-icons/fi";

function JobList({ jobs, fetchJobs }) {

  const [generating, setGenerating] = useState(null);

  const deleteJob = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      toast.success("Job deleted");
      fetchJobs();
    } catch(err) {
      toast.error("Error deleting job");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/jobs/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchJobs();
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const updateNotes = async (id, notes) => {
    try {
        await api.put(`/jobs/${id}`, { notes });
        toast.success("Notes saved");
        fetchJobs();
    } catch (err) {
        toast.error("Error saving notes");
    }
  };

  const generateCoverLetter = async (job) => {
    setGenerating(job._id);
    try {
      const res = await api.post(`/ai/cover-letter`, {
        role: job.role,
        company: job.company
      });
      console.log(res.data);
      // For now we will download it as a text file
      const blob = new Blob([res.data.coverLetter], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CoverLetter_${job.company.replace(/\s+/g, "")}.txt`;
      a.click();
      toast.success("Cover letter generated and downloaded!");
    } catch(err) {
      toast.error("Failed to generate cover letter. Did you upload a resume to the Ranker first?");
    } finally {
      setGenerating(null);
    }
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#161b22] border border-[#21262d] rounded-xl">
        <svg className="w-12 h-12 text-[#21262d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-200">No applications yet</h3>
        <p className="text-sm text-[#8b949e] mt-1">Start applying to jobs and track them here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 border-b border-[#21262d] text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
        <div className="col-span-3">Company & Role</div>
        <div className="col-span-2">Date Applied</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Notes</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-[#161b22] border border-[#21262d] hover:border-[#00e5a0]/50 p-4 rounded-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group"
        >
          {/* Company & Role */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              {job.company} 
              {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-[#8b949e] hover:text-[#00e5a0]">
                  <FiExternalLink />
                </a>
              )}
            </h3>
            <p className="text-[#00e5a0] text-sm font-medium">{job.role}</p>
          </div>

          {/* Date Applied */}
          <div className="col-span-1 md:col-span-2">
            {job.appliedAt ? (
              <span className="text-sm text-[#8b949e]">
                {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
              </span>
            ) : (
              <span className="text-sm text-[#8b949e] opacity-50">N/A</span>
            )}
          </div>

          {/* Status */}
          <div className="col-span-1 md:col-span-2">
            <select
              value={job.status}
              onChange={(e) => updateStatus(job._id, e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-colors border ${
                job.status === "Interview" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                job.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                "bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/30"
              }`}
            >
              <option value="Applied" className="bg-[#161b22] text-gray-300">Applied</option>
              <option value="Interview" className="bg-[#161b22] text-gray-300">Interview</option>
              <option value="Rejected" className="bg-[#161b22] text-gray-300">Rejected</option>
            </select>
          </div>

          {/* Notes */}
          <div className="col-span-1 md:col-span-3">
            <textarea
              placeholder="Add prep notes..."
              defaultValue={job.notes}
              onBlur={(e) => updateNotes(job._id, e.target.value)}
              className="w-full text-sm px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded-lg text-gray-300 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus-visible:ring-1 focus-visible:ring-[#00e5a0] transition-all resize-none h-10 hover:h-20 focus:h-20"
            />
          </div>

          {/* Actions */}
          <div className="col-span-1 md:col-span-2 flex flex-row md:flex-col lg:flex-row justify-end items-center gap-2 mt-2 md:mt-0">
            <button
              onClick={() => generateCoverLetter(job)}
              disabled={generating === job._id}
              title="AI Cover Letter"
              className="text-[#8b949e] hover:text-[#00e5a0] p-2 border border-[#21262d] hover:border-[#00e5a0]/50 rounded-lg bg-[#0d1117] transition-colors focus-visible:ring-1 focus-visible:ring-[#00e5a0]"
            >
              <FiCpu className={generating === job._id ? "animate-spin text-[#00e5a0]" : ""} />
            </button>
            <button
              onClick={() => deleteJob(job._id)}
              title="Delete Job"
              className="text-[#8b949e] hover:text-red-400 p-2 border border-[#21262d] hover:border-red-500/50 rounded-lg bg-[#0d1117] transition-colors focus-visible:ring-1 focus-visible:ring-red-500"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;