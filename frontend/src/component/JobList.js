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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-gray-800/50 border border-gray-800 hover:border-gray-700 p-5 rounded-xl transition-all duration-300 flex flex-col gap-4 relative group"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                {job.company} 
                {job.jobUrl && (
                  <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-emerald-400">
                    <FiExternalLink />
                  </a>
                )}
              </h3>
              <p className="text-emerald-400 text-sm font-medium">{job.role}</p>
              {job.appliedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Applied {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
                </p>
              )}
            </div>

            {/* Status Badge Select */}
            <select
              value={job.status}
              onChange={(e) => updateStatus(job._id, e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none transition-colors border ${
                job.status === "Interview" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                job.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              <option value="Applied" className="bg-gray-900 text-gray-300">Applied</option>
              <option value="Interview" className="bg-gray-900 text-gray-300">Interview</option>
              <option value="Rejected" className="bg-gray-900 text-gray-300">Rejected</option>
            </select>
          </div>

          {/* Notes */}
          <textarea
            placeholder="Add prep notes..."
            defaultValue={job.notes}
            onBlur={(e) => updateNotes(job._id, e.target.value)}
            className="w-full text-sm p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none h-20"
          />

          {/* Actions */}
          <div className="flex justify-between items-center mt-auto pt-2">
            <button
              onClick={() => generateCoverLetter(job)}
              disabled={generating === job._id}
              className="text-xs font-semibold text-gray-400 hover:text-emerald-400 px-3 py-1.5 rounded-md hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
            >
              <FiCpu className={generating === job._id ? "animate-spin text-emerald-400" : ""} />
              {generating === job._id ? "Drafting..." : "AI Cover Letter"}
            </button>
            <button
              onClick={() => deleteJob(job._id)}
              className="text-xs font-semibold text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <FiTrash2 />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;