import React, { useState } from "react";
import axios from "axios";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [role, setRole] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a resume file first.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("role", role);

        setLoading(true);
        setResult("");

        try {
            const res = await axios.post(
                "https://jobserve-hghp.onrender.com/ai/analyze",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setResult(res.data.result);
        } catch (err) {
            console.error(err);
            const backendError = err.response?.data?.details || err.response?.data?.message || err.message;
            setResult("Error analyzing resume: " + backendError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto my-6 p-6 md:p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col gap-8 text-gray-100 font-sans">
            <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">AI Resume Analyzer</h2>
                    <p className="text-sm text-gray-400 mt-1">Discover how well your resume matches the target role instantly.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Upload Resume (PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-3 file:px-4
                          file:rounded-l-lg file:border-0
                          file:text-sm file:font-bold
                          file:bg-emerald-500/10 file:text-emerald-500
                          hover:file:bg-emerald-500/20 file:transition-colors file:cursor-pointer
                          border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Target Job Role</label>
                    <input
                        className="block w-full text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        placeholder="e.g. Full Stack Developer"
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`relative overflow-hidden group font-bold px-8 py-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 w-full md:w-auto self-start flex items-center justify-center gap-2 ${loading ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed shadow-none hover:shadow-none" : "bg-emerald-500 hover:bg-emerald-400 text-gray-900 border border-transparent"}`}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Document...
                    </span>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Analyze Alignment
                    </>
                )}
            </button>

            {result && (
                <div className="mt-2 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Analysis Results
                    </h3>
                    <div className="relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-lg shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                        <pre className="bg-[#0e141a] p-6 rounded-lg rounded-l-none border border-gray-800 text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-hidden break-words shadow-inner">
                            {result}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResumeAnalyzer;