import React from "react";
import axios from "axios";

function JobList({ jobs, fetchJobs, token }) {

  const deleteJob = async (id) => {
    await axios.delete(`https://jobserve-hghp.onrender.com/jobs/${id}`, {
      headers: { Authorization: token }
    });
    fetchJobs();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`https://jobserve-hghp.onrender.com/jobs/${id}`, { status }, {
      headers: { Authorization: token }
    });
    fetchJobs();
  };
  const updateNotes = async (id, notes) => {
    await axios.put(`https://jobserve-hghp.onrender.com/jobs/${id}`, { notes }, {
      headers: { Authorization: token }
    });
    fetchJobs();
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
            <div>
              <h3 className="text-lg font-bold text-gray-100">{job.company}</h3>
              <p className="text-emerald-400 text-sm font-medium">{job.role}</p>
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
          <div className="flex justify-end mt-auto pt-2">
            <button 
              onClick={() => deleteJob(job._id)}
              className="text-xs font-semibold text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobList;