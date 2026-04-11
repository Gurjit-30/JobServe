import React, { useState } from "react";
import axios from "axios";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [role, setRole] = useState("");
    const [result, setResult] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("role", role);

        const res = await axios.post(
            "https://your-backend-url.onrender.com/ai/analyze",
            formData
        );

        setResult(res.data.result);
    };

    return (
        <div className="mt-6 p-4 border rounded">
            <h2 className="text-lg font-bold">AI Resume Analyzer</h2>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <input
                className="border p-2 w-full mt-2"
                placeholder="Enter job role (e.g. Frontend Developer)"
                onChange={(e) => setRole(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 mt-2"
            >
                Analyze
            </button>

            {result && (
                <pre className="mt-4 bg-gray-100 p-3 rounded">
                    {result}
                </pre>
            )}
        </div>
    );
}

export default ResumeAnalyzer;