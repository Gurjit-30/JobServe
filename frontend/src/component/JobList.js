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
    <div>
      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-white p-4 rounded shadow mt-4"
        >
          <h3>{job.company}</h3>
          <p>{job.role}</p>

          {/* STATUS DROPDOWN */}
          <select
            value={job.status}
            onChange={(e) => updateStatus(job._id, e.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* NOTES TEXTAREA */}
          <textarea
            placeholder="Add notes..."
            defaultValue={job.notes}
            onBlur={(e) => updateNotes(job._id, e.target.value)}
            className="w-full border p-2 mt-2"
          />

          <br /><br />

          <button onClick={() => deleteJob(job._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default JobList;