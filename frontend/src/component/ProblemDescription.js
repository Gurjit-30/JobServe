import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api";
import "../index.css";

export default function ProblemDescription({ refreshKey }) {
  const [activeTab, setActiveTab] = useState("description");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const res = await api.get("/challenges/daily");
      setChallenge(res.data);
    } catch (err) {
      console.error("Failed to fetch daily challenge:", err);
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeTab, refreshKey]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/run-code/submissions");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "text-gray-400";
    if (status.includes("Accepted")) return "text-emerald-400";
    if (status.includes("Error") || status.includes("Wrong") || status.includes("Exceeded")) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="problem-description-wrapper animate-fade-in-scale flex flex-col h-full">
      <div className="bg-black/20 border-b border-white/5 pt-2">
        <div className="flex w-full items-end gap-6 px-6 pt-2">
          <button 
            className={\`pb-3 font-semibold transition-colors \${activeTab === "description" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-gray-200"}\`}
            onClick={() => { setActiveTab("description"); setSelectedSubmission(null); }}
          >
            Description
          </button>
          <button 
            className={\`pb-3 font-semibold transition-colors \${activeTab === "submissions" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-gray-200"}\`}
            onClick={() => { setActiveTab("submissions"); setSelectedSubmission(null); }}
          >
            Submissions
          </button>
        </div>
      </div>

      <div className="problem-body flex-1 overflow-y-auto">
        {activeTab === "description" && (
          <div className="p-6">
            {loadingChallenge ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : challenge ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-200">Daily Challenge: {challenge.title}</h2>
                  <span className={\`difficulty-badge \${challenge.difficulty.toLowerCase()}\`}>{challenge.difficulty}</span>
                </div>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  className="markdown-body"
                >
                  {challenge.markdown}
                </ReactMarkdown>
              </>
            ) : (
              <div className="text-gray-400">Failed to load today's challenge.</div>
            )}
          </div>
        )}

        {activeTab === "submissions" && !selectedSubmission && (
          <div className="p-0">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No submissions found. Try running some code!</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Time Submitted</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Language</th>
                    <th className="px-6 py-3">Runtime</th>
                    <th className="px-6 py-3">Memory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {submissions.map(sub => (
                    <tr 
                      key={sub._id} 
                      className="hover:bg-gray-800/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      <td className="px-6 py-4 text-gray-300">{formatDate(sub.createdAt)}</td>
                      <td className={\`px-6 py-4 font-semibold \${getStatusColor(sub.status)}\`}>{sub.status}</td>
                      <td className="px-6 py-4 text-gray-300"><span className="bg-gray-800 px-2 py-1 rounded text-xs">{sub.language}</span></td>
                      <td className="px-6 py-4 text-gray-400">{sub.runtime ? \`\${sub.runtime} s\` : "N/A"}</td>
                      <td className="px-6 py-4 text-gray-400">{sub.memory ? \`\${(sub.memory/1024).toFixed(1)} MB\` : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "submissions" && selectedSubmission && (
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
              <div>
                <button onClick={() => setSelectedSubmission(null)} className="text-sm text-emerald-400 hover:underline mb-2 inline-block">&larr; Back to all submissions</button>
                <h3 className={\`text-lg font-bold \${getStatusColor(selectedSubmission.status)}\`}>
                  {selectedSubmission.status}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {formatDate(selectedSubmission.createdAt)}
                </p>
              </div>
              <div className="flex gap-4 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                <div><span className="text-gray-500 block text-xs">Language</span><span className="font-mono text-gray-200">{selectedSubmission.language}</span></div>
                <div><span className="text-gray-500 block text-xs">Runtime</span><span className="text-gray-200">{selectedSubmission.runtime ? \`\${selectedSubmission.runtime}s\` : "N/A"}</span></div>
                <div><span className="text-gray-500 block text-xs">Memory</span><span className="text-gray-200">{selectedSubmission.memory ? \`\${(selectedSubmission.memory/1024).toFixed(1)} MB\` : "N/A"}</span></div>
              </div>
            </div>
            <div className="flex-1 rounded-md overflow-hidden border border-gray-700/50 bg-[#1e1e1e]">
              <div className="bg-[#2d2d2d] px-4 py-2 text-xs font-mono text-gray-400 flex items-center gap-2">
                <span className="text-emerald-500">{"</>"}</span> Source Code
              </div>
              <pre className="p-4 text-sm font-mono text-gray-300 overflow-auto max-h-[400px]">
                {selectedSubmission.code}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
