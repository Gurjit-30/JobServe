import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "@monaco-editor/react";
import api from "../api";
import Leaderboard from "./Leaderboard";

// ── Mock problem list (shown in left panel) ────────────────────────────────
const PROBLEM_DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const PROBLEM_TOPICS = ["All", "Arrays", "Strings", "Linked Lists", "Trees", "DP", "Graphs", "Sorting"];

const STATIC_PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy",   topics: ["Arrays"],       solved: true  },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", topics: ["Linked Lists"], solved: false },
  { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["Strings"], solved: false },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard",   topics: ["Arrays", "Sorting"], solved: false },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", topics: ["Strings", "DP"], solved: false },
  { id: 7, title: "Reverse Integer", difficulty: "Medium", topics: ["Arrays"], solved: true },
  { id: 9, title: "Palindrome Number", difficulty: "Easy", topics: ["Arrays"], solved: true },
  { id: 20, title: "Valid Parentheses", difficulty: "Easy",   topics: ["Strings"], solved: false },
  { id: 21, title: "Merge Two Sorted Lists", difficulty: "Easy",   topics: ["Linked Lists"], solved: false },
  { id: 53, title: "Maximum Subarray", difficulty: "Medium", topics: ["Arrays", "DP"], solved: false },
  { id: 70, title: "Climbing Stairs", difficulty: "Easy",   topics: ["DP"], solved: false },
  { id: 104, title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Trees"], solved: false },
  { id: 121, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Arrays"], solved: false },
  { id: 200, title: "Number of Islands", difficulty: "Medium", topics: ["Graphs"], solved: false },
  { id: 206, title: "Reverse Linked List", difficulty: "Easy", topics: ["Linked Lists"], solved: false },
  { id: 300, title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["DP"], solved: false },
  { id: 322, title: "Coin Change", difficulty: "Medium", topics: ["DP"], solved: false },
  { id: 560, title: "Subarray Sum Equals K", difficulty: "Medium", topics: ["Arrays"], solved: false },
];

const DIFFICULTY_COLORS = {
  Easy:   { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  Medium: { text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"   },
  Hard:   { text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20"     },
};

// ── Language configs ───────────────────────────────────────────────────────
const LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍", monacoId: "python"     },
  { id: "java",       label: "Java",       icon: "☕", monacoId: "java"       },
  { id: "cpp",        label: "C++",        icon: "⚡", monacoId: "cpp"        },
  { id: "javascript", label: "JavaScript", icon: "🟨", monacoId: "javascript" },
];

const STARTER_CODE = {
  python:     "def solution():\n    # Write your solution here\n    pass\n",
  java:       "class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n",
  cpp:        "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};\n",
  javascript: "/**\n * @return {void}\n */\nvar solution = function() {\n    // Write your solution here\n};\n",
};

function getStatusStyle(statusId) {
  if (statusId === 3)  return { color: "#22c55e", label: "Accepted",           icon: "✓" };
  if (statusId === 4)  return { color: "#f59e0b", label: "Wrong Answer",       icon: "✗" };
  if (statusId === 5)  return { color: "#ef4444", label: "Time Limit Exceeded",icon: "⏱" };
  if (statusId >= 6)   return { color: "#ef4444", label: "Error",              icon: "💥" };
  return { color: "#94a3b8", label: "Unknown", icon: "?" };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const [activeView, setActiveView] = useState("practice"); // 'practice' | 'leaderboard'
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [problems, setProblems] = useState(STATIC_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState(STATIC_PROBLEMS[0]);
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE["python"]);
  const [theme, setTheme] = useState("vs-dark");
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const editorRef = useRef(null);

  // Load daily challenge for description panel
  useEffect(() => {
    api.get("/challenges/daily")
      .then(res => setDailyChallenge(res.data))
      .catch(() => {});
      
    api.get("/api/problems")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setProblems(res.data);
          setSelectedProblem(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Load submissions when tab changes
  useEffect(() => {
    if (activeTab === "submissions") {
      setLoadingSubs(true);
      api.get("/run-code/submissions")
        .then(res => setSubmissions(res.data))
        .catch(() => {})
        .finally(() => setLoadingSubs(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedProblem?.baseCodeTemplates && selectedProblem.baseCodeTemplates[language]) {
      setCode(selectedProblem.baseCodeTemplates[language]);
    } else {
      setCode(STARTER_CODE[language]);
    }
  }, [selectedProblem, language]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const res = await api.post("/api/execute", { 
        language, 
        code, 
        problemId: selectedProblem?._id || selectedProblem?.id 
      });
      
      const v = res.data.verdict;
      const statusId = v === "Accepted" ? 3 : v === "Wrong Answer" ? 4 : v === "Time Limit Exceeded" ? 5 : v === "Compilation Error" ? 6 : 13;
      
      let outText = res.data.actualOutput || "";
      if (v === "Wrong Answer") outText = `Failed at Test Case ${res.data.testCaseIndex}\nActual Output:\n${outText}`;
      else if (v === "Time Limit Exceeded") outText = `Time Limit Exceeded at Test Case ${res.data.testCaseIndex}`;

      setOutput({
        stdout:         outText,
        stderr:         res.data.details || "",
        compile_output: v === "Compilation Error" ? res.data.details : "",
        status:         { id: statusId, description: v },
        time:           res.data.time || "N/A",
        memory:         res.data.memory || 0,
        error:          null,
      });
      // Refresh submissions after run
      if (activeTab === "submissions") {
        api.get("/run-code/submissions").then(r => setSubmissions(r.data)).catch(() => {});
      }
    } catch (err) {
      setOutput({
        stdout: "", stderr: "", compile_output: "",
        status: { id: 0, description: "Error" },
        time: null, memory: null,
        error: err.response?.data?.error || err.message || "Failed to execute code.",
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, selectedProblem, activeTab]);

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.getValue()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const outputText = output
    ? output.error
      ? output.error
      : [output.compile_output, output.stdout, output.stderr].filter(Boolean).join("\n") || "(No output)"
    : "";

  const statusStyle = output?.status ? getStatusStyle(output.status.id) : null;

  const filteredProblems = problems.filter(p => {
    const matchDiff  = diffFilter  === "All" || p.difficulty === diffFilter;
    const matchTopic = topicFilter === "All" || (p.topics && p.topics.includes(topicFilter));
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiff && matchTopic && matchSearch;
  });

  const formatDate = (d) => new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Top View Toggle ── */}
      <div className="flex items-center gap-1 mb-4 bg-[#161b22] border border-[#21262d] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveView("practice")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === "practice" ? "bg-[#00e5a0] text-[#0d1117] shadow-[0_0_12px_rgba(0,229,160,0.3)]" : "text-[#8b949e] hover:text-white"}`}
        >
          <span className="mr-2">⌨</span> Practice Arena
        </button>
        <button
          onClick={() => setActiveView("leaderboard")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === "leaderboard" ? "bg-[#00e5a0] text-[#0d1117] shadow-[0_0_12px_rgba(0,229,160,0.3)]" : "text-[#8b949e] hover:text-white"}`}
        >
          <span className="mr-2">🏆</span> Leaderboard
        </button>
      </div>

      {/* ── Leaderboard View ── */}
      {activeView === "leaderboard" && (
        <div className="flex-1 min-h-0">
          <Leaderboard />
        </div>
      )}

      {/* ── Practice Arena View ── */}
      {activeView === "practice" && (
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 180px)" }}>

          {/* ── LEFT: Problem List Panel ── */}
          <div className="w-64 shrink-0 bg-[#161b22] border border-[#21262d] rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#21262d] shrink-0">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00e5a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Problem List
              </h2>
              {/* Search */}
              <div className="relative mb-2">
                <svg className="w-4 h-4 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] transition-all"
                />
              </div>
              {/* Difficulty filter */}
              <div className="flex flex-wrap gap-1 mb-2">
                {PROBLEM_DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${diffFilter === d ? "bg-[#00e5a0] text-[#0d1117]" : "bg-[#0d1117] text-[#8b949e] border border-[#21262d] hover:text-white"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {/* Topic filter */}
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#00e5a0] transition-all"
              >
                {PROBLEM_TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Problem list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredProblems.map(p => {
                const dc = DIFFICULTY_COLORS[p.difficulty];
                const isSelected = selectedProblem?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProblem(p); setActiveTab("description"); }}
                    className={`w-full text-left px-4 py-3 border-b border-[#21262d] transition-all hover:bg-white/5 ${isSelected ? "bg-[#00e5a0]/5 border-l-2 border-l-[#00e5a0]" : "border-l-2 border-l-transparent"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isSelected ? "text-[#00e5a0]" : "text-[#8b949e]"}`}>
                        #{p.id}
                      </span>
                      {p.solved && (
                        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-xs font-medium mt-0.5 leading-tight ${isSelected ? "text-white" : "text-gray-300"}`}>
                      {p.title}
                    </p>
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${dc.text} ${dc.bg}`}>
                      {p.difficulty}
                    </span>
                  </button>
                );
              })}
              {filteredProblems.length === 0 && (
                <div className="p-4 text-center text-xs text-[#8b949e]">No problems match your filters.</div>
              )}
            </div>

            {/* Stats footer */}
            <div className="p-3 border-t border-[#21262d] shrink-0">
              <div className="flex justify-between text-xs text-[#8b949e]">
                <span>✅ {problems.filter(p => p.solved).length} solved</span>
                <span>{problems.length} total</span>
              </div>
              <div className="mt-1.5 w-full bg-[#21262d] rounded-full h-1">
                <div
                  className="bg-[#00e5a0] h-1 rounded-full transition-all"
                  style={{ width: `${(problems.filter(p => p.solved).length / Math.max(1, problems.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Problem Description Panel ── */}
          <div className="w-[340px] shrink-0 bg-[#161b22] border border-[#21262d] rounded-xl flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#21262d] shrink-0 bg-[#0d1117]">
              {["description", "hints", "submissions"].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedSub(null); }}
                  className={`px-4 py-3 text-xs font-semibold capitalize transition-all ${activeTab === tab ? "text-[#00e5a0] border-b-2 border-[#00e5a0]" : "text-[#8b949e] hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="p-5">
                  {/* Problem header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-base font-bold text-white leading-tight">
                        {selectedProblem?.id}. {selectedProblem?.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProblem && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[selectedProblem.difficulty].text} ${DIFFICULTY_COLORS[selectedProblem.difficulty].bg} ${DIFFICULTY_COLORS[selectedProblem.difficulty].border}`}>
                          {selectedProblem.difficulty}
                        </span>
                      )}
                      {selectedProblem?.topics?.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#21262d]">{t}</span>
                      ))}
                    </div>
                  </div>

                  {selectedProblem?.description ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedProblem.description}
                      </ReactMarkdown>
                    </div>
                  ) : dailyChallenge ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
                      {dailyChallenge.markdown}
                    </ReactMarkdown>
                  ) : (
                    <div className="space-y-3 text-sm text-[#8b949e]">
                      <p>Select a problem from the list to view its description.</p>
                      <p>Today's daily challenge content loads automatically when the backend is connected.</p>
                      <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 mt-4">
                        <p className="text-xs font-semibold text-[#00e5a0] mb-2">💡 Example</p>
                        <pre className="text-xs text-gray-300 font-mono">Input: nums = [2,7,11,15], target = 9{"\n"}Output: [0,1]{"\n"}Explanation: nums[0] + nums[1] == 9</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hints Tab */}
              {activeTab === "hints" && (
                <div className="p-5 space-y-3">
                  <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider mb-4">Problem Hints</p>
                  {[
                    { num: 1, hint: "Think about what data structure would let you look up values in O(1) time." },
                    { num: 2, hint: "For each element, consider what value you need to find to complete the pair." },
                    { num: 3, hint: "A hash map storing value → index lets you check complements instantly." },
                  ].map(h => (
                    <details key={h.num} className="group bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden">
                      <summary className="px-4 py-3 text-sm font-medium text-[#8b949e] cursor-pointer hover:text-white transition-colors select-none flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00e5a0]/10 text-[#00e5a0] text-xs flex items-center justify-center font-bold shrink-0">{h.num}</span>
                        Hint {h.num}
                        <svg className="w-4 h-4 ml-auto group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-gray-300 border-t border-[#21262d] pt-3">{h.hint}</div>
                    </details>
                  ))}
                  <div className="mt-6 bg-[#00e5a0]/5 border border-[#00e5a0]/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#00e5a0] mb-1">🎯 Complexity Goal</p>
                    <p className="text-xs text-gray-300">Time: <span className="text-[#00e5a0] font-mono">O(n)</span> &nbsp;|&nbsp; Space: <span className="text-[#00e5a0] font-mono">O(n)</span></p>
                  </div>
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === "submissions" && (
                <div>
                  {selectedSub ? (
                    <div className="p-5">
                      <button onClick={() => setSelectedSub(null)} className="text-xs text-[#00e5a0] hover:underline mb-4 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        Back
                      </button>
                      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden">
                        <div className="px-4 py-2 border-b border-[#21262d] flex items-center gap-2">
                          <span className="text-xs text-emerald-400 font-mono">{"</>"}</span>
                          <span className="text-xs text-[#8b949e]">Source Code</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-gray-300 overflow-auto max-h-80">{selectedSub.code}</pre>
                      </div>
                    </div>
                  ) : loadingSubs ? (
                    <div className="p-6 text-center text-xs text-[#8b949e]">Loading submissions...</div>
                  ) : submissions.length === 0 ? (
                    <div className="p-6 text-center">
                      <svg className="w-10 h-10 text-[#21262d] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      <p className="text-xs text-[#8b949e]">No submissions yet. Run some code!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#21262d]">
                      {submissions.map(sub => {
                        const ss = getStatusStyle(sub.status?.id || 3);
                        return (
                          <button key={sub._id} onClick={() => setSelectedSub(sub)} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold" style={{ color: ss.color }}>{ss.icon} {sub.status?.description || "Accepted"}</span>
                              <span className="text-[10px] text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded font-mono">{sub.language}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8b949e]">
                              <span>{formatDate(sub.createdAt)}</span>
                              {sub.runtime && <span>⏱ {sub.runtime}s</span>}
                              {sub.memory && <span>🧠 {(sub.memory/1024).toFixed(1)}MB</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Code Editor Panel ── */}
          <div className="flex-1 min-w-0 bg-[#161b22] border border-[#21262d] rounded-xl flex flex-col overflow-hidden">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262d] shrink-0 bg-[#0d1117] flex-wrap gap-2">
              {/* Language selector */}
              <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] rounded-lg p-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-bold transition-all ${language === lang.id ? "bg-[#00e5a0] text-[#0d1117]" : "text-[#8b949e] hover:text-white hover:bg-white/5"}`}
                  >
                    <span>{lang.icon}</span>
                    <span className="hidden sm:inline">{lang.label}</span>
                  </button>
                ))}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTheme(t => t === "vs-dark" ? "light" : "vs-dark")}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs text-[#8b949e] hover:text-white hover:bg-white/5 border border-[#21262d] transition-all"
                  title="Toggle theme"
                >
                  {theme === "vs-dark" ? "🌙" : "☀️"}
                </button>
                <button
                  onClick={() => setShowStdin(v => !v)}
                  className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-bold border transition-all ${showStdin ? "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/40" : "text-[#8b949e] hover:text-white border-[#21262d] hover:bg-white/5"}`}
                >
                  ⌨ stdin
                </button>
                <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs text-[#8b949e] hover:text-white hover:bg-white/5 border border-[#21262d] transition-all">
                  {copied ? "✓ Copied" : "⎘ Copy"}
                </button>
                <button onClick={() => setCode(STARTER_CODE[language])} className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs text-[#8b949e] hover:text-white hover:bg-white/5 border border-[#21262d] transition-all">
                  ↺ Reset
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  id="run-code-btn-practice"
                  className={`flex items-center gap-1.5 px-4 h-7 rounded-lg text-xs font-bold text-[#0d1117] transition-all shadow-[0_0_12px_rgba(0,229,160,0.2)] ${isRunning ? "bg-[#00c58a]" : "bg-[#00e5a0] hover:bg-[#00c58a]"}`}
                >
                  {isRunning ? (
                    <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Running…</>
                  ) : (
                    <><span>▶</span> Run Code</>
                  )}
                </button>
              </div>
            </div>

            {/* Stdin panel */}
            {showStdin && (
              <div className="px-4 py-3 border-b border-[#21262d] bg-[#0d1117] shrink-0">
                <label className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider mb-1.5 block">⌨ Standard Input</label>
                <textarea
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  rows={2}
                  placeholder="Enter input values here, one per line..."
                  className="w-full bg-[#161b22] border border-[#3b82f6]/30 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6] resize-none"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Monaco editor */}
            <div className="flex-1 min-h-0">
              {/* fake IDE chrome */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1e1e1e] border-b border-black/30">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs font-mono text-[#64748b]">
                  {LANGUAGES.find(l => l.id === language)?.icon} solution.{language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : language === "javascript" ? "js" : "ts"}
                </span>
              </div>
              <Editor
                height="100%"
                language={LANGUAGES.find(l => l.id === language)?.monacoId}
                theme={theme}
                value={code}
                onChange={val => setCode(val || "")}
                onMount={ed => { editorRef.current = ed; ed.focus(); }}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  tabSize: 4,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  bracketPairColorization: { enabled: true },
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: "all",
                }}
              />
            </div>

            {/* Output panel */}
            {showOutput && (
              <div className="border-t border-[#21262d] shrink-0 bg-[#0d1117] max-h-48">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8b949e] font-mono">❯_</span>
                    <span className="text-xs font-bold text-gray-200">Output</span>
                    {statusStyle && output && !output.error && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: statusStyle.color, borderColor: statusStyle.color + "44" }}>
                        {statusStyle.icon} {output.status?.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {output?.time && <span className="text-[10px] text-[#8b949e]">⏱ {output.time}s</span>}
                    {output?.memory && <span className="text-[10px] text-[#8b949e]">🧠 {(output.memory/1024).toFixed(1)}MB</span>}
                    <button onClick={() => setShowOutput(false)} className="text-[#8b949e] hover:text-[#f87171] text-xs transition-colors">✕</button>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-32 custom-scrollbar">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                      <div className="w-3 h-3 border border-[#00e5a0] border-t-transparent rounded-full animate-spin" />
                      Executing on Judge0 sandbox…
                    </div>
                  ) : (
                    <pre className={`text-xs font-mono whitespace-pre-wrap ${output?.error || (output?.status?.id !== 3 && output?.status?.id !== 0) ? "text-red-400" : "text-emerald-300"}`}>
                      {outputText}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
