import React, { useState } from "react";
import axios from "axios";

function JobForm({ fetchJobs, token }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("https://jobserve-hghp.onrender.com/jobs/add", {
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border p-2 flex-1 rounded"
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        className="border p-2 flex-1 rounded"
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 rounded">
        Add
      </button>
    </form>
  );
}

export default JobForm;






