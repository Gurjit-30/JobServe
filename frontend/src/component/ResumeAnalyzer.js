import React, { useState } from "react";
import api from "../api";

// ─── Rank Config (Call of Duty-style tiers) ──────────────────────────────────
const RANKS = [
  {
    grade: "Rookie",
    min: 0, max: 19,
    label: "Rookie",
    color: "#6b7280",
    glow: "rgba(107,114,128,0.5)",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.3)",
    icon: "🪖",
    description: "Your resume needs significant work. Let's build from scratch.",
    barColor: "#6b7280",
  },
  {
    grade: "Contender",
    min: 20, max: 39,
    label: "Contender",
    color: "#cd7f32",
    glow: "rgba(205,127,50,0.5)",
    bg: "rgba(205,127,50,0.08)",
    border: "rgba(205,127,50,0.3)",
    icon: "🥉",
    description: "You're getting there. Core improvements will level you up fast.",
    barColor: "#cd7f32",
  },
  {
    grade: "Skilled",
    min: 40, max: 59,
    label: "Skilled",
    color: "#c0c0c0",
    glow: "rgba(192,192,192,0.5)",
    bg: "rgba(192,192,192,0.08)",
    border: "rgba(192,192,192,0.3)",
    icon: "🥈",
    description: "Solid foundation. A few targeted tweaks will make you competitive.",
    barColor: "#c0c0c0",
  },
  {
    grade: "Expert",
    min: 60, max: 74,
    label: "Expert",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.5)",
    bg: "rgba(255,215,0,0.08)",
    border: "rgba(255,215,0,0.3)",
    icon: "🥇",
    description: "Strong resume. You'll pass most ATS filters with ease.",
    barColor: "#ffd700",
  },
  {
    grade: "Elite",
    min: 75, max: 89,
    label: "Elite",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.5)",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.3)",
    icon: "💎",
    description: "Top-tier candidate. Recruiters will notice you immediately.",
    barColor: "#38bdf8",
  },
  {
    grade: "Legendary",
    min: 90, max: 100,
    label: "Legendary",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.6)",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.4)",
    icon: "☄️",
    description: "LEGENDARY. Your resume is a weapon. Recruiters don't stand a chance.",
    barColor: "linear-gradient(90deg, #a855f7, #ec4899)",
  },
];

function getRank(score) {
  return RANKS.find((r) => score >= r.min && score <= r.max) || RANKS[0];
}

// ─── Rank Badge Component ─────────────────────────────────────────────────────
function RankBadge({ score, grade }) {
  const rank = getRank(score);
  const rankIndex = RANKS.findIndex((r) => r.grade === rank.grade);

  return (
    <div
      style={{
        background: rank.bg,
        border: `1.5px solid ${rank.border}`,
        boxShadow: `0 0 30px ${rank.glow}, 0 0 60px ${rank.glow}20`,
      }}
      className="rounded-2xl p-6 flex flex-col items-center gap-4 relative overflow-hidden"
    >
      {/* Animated glow pulse behind icon */}
      <div
        style={{
          background: rank.glow,
          filter: "blur(40px)",
          opacity: 0.3,
        }}
        className="absolute top-4 w-24 h-24 rounded-full pointer-events-none animate-pulse"
      />

      {/* Rank Icon */}
      <div
        style={{
          fontSize: "4rem",
          filter: `drop-shadow(0 0 16px ${rank.glow})`,
        }}
        className="relative z-10 select-none"
      >
        {rank.icon}
      </div>

      {/* Rank Name */}
      <div className="text-center relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-1">
          ATS Rank
        </p>
        <h3
          style={{ color: rank.color, textShadow: `0 0 20px ${rank.glow}` }}
          className="text-3xl font-black uppercase tracking-wider"
        >
          {rank.label}
        </h3>
        <p className="text-xs text-gray-400 mt-2 max-w-[200px] text-center leading-snug">
          {rank.description}
        </p>
      </div>

      {/* Score Ring */}
      <div className="relative w-24 h-24 relative z-10">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="45" cy="45" r="38"
            fill="none"
            stroke={rank.color}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 38}`}
            strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${rank.color})`,
              transition: "stroke-dashoffset 1.2s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            style={{ color: rank.color }}
            className="text-2xl font-black leading-none"
          >
            {score}
          </span>
          <span className="text-xs text-gray-500 font-bold">/100</span>
        </div>
      </div>

      {/* Tier progression dots */}
      <div className="flex items-center gap-2 relative z-10">
        {RANKS.map((r, i) => (
          <div
            key={r.grade}
            title={r.label}
            style={{
              background: i <= rankIndex ? r.color : "#374151",
              boxShadow: i <= rankIndex ? `0 0 6px ${r.glow}` : "none",
            }}
            className={`rounded-full transition-all duration-500 ${
              i === rankIndex ? "w-4 h-4 -mt-0.5" : "w-2.5 h-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatList({ title, items, color, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4
        className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
        style={{ color }}
      >
        <span>{icon}</span> {title}
      </h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-gray-300 flex items-start gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-800"
          >
            <span style={{ color }} className="mt-0.5 shrink-0">▸</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a resume PDF first."); return; }
    if (!role.trim()) { setError("Please enter a target job role."); return; }
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post(
        `/ai/analyze`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.message || err.message;
      setError("Analysis failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const rank = result ? getRank(result.score ?? 0) : null;

  return (
    <div className="w-full mx-auto my-6 p-6 md:p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col gap-8 text-gray-100 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            AI Resume Ranker
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Upload your resume · Get your ATS rank · Dominate the job market.
          </p>
        </div>
      </div>

      {/* Form */}
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
          {file && (
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <span>✓</span> {file.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Target Job Role</label>
          <input
            className="block w-full text-sm p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            placeholder="e.g. Full Stack Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`relative overflow-hidden font-bold px-8 py-3.5 rounded-xl transition-all duration-300 w-full md:w-auto self-start flex items-center justify-center gap-2 ${
          loading
            ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
            : "bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Deploying Analysis...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze &amp; Rank Resume
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 px-2">
              Combat Report
            </span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Badge + Summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <RankBadge score={result.score ?? 0} grade={result.grade} />

            {/* Summary card */}
            <div
              style={{
                background: rank?.bg,
                border: `1px solid ${rank?.border}`,
              }}
              className="rounded-2xl p-5 flex flex-col gap-4 h-full justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Field Assessment
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* All 6 rank tiers display */}
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Rank Tiers
                </p>
                {RANKS.map((r) => (
                  <div key={r.grade} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{r.icon}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        style={{
                          width: `${((r.max - r.min + 1) / 100) * 100}%`,
                          background: r.color,
                          boxShadow: r.grade === result.grade ? `0 0 8px ${r.glow}` : "none",
                          opacity: r.grade === result.grade ? 1 : 0.3,
                        }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                    <span
                      style={{
                        color: r.grade === result.grade ? r.color : "#4b5563",
                        fontWeight: r.grade === result.grade ? "800" : "500",
                      }}
                      className="text-xs w-20 text-right"
                    >
                      {r.label} {r.grade === result.grade ? "◄" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths / Weaknesses / Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatList
              title="Strengths"
              items={result.strengths}
              color="#10b981"
              icon="⚡"
            />
            <StatList
              title="Weaknesses"
              items={result.weaknesses}
              color="#f59e0b"
              icon="⚠️"
            />
            <StatList
              title="Suggestions"
              items={result.suggestions}
              color="#38bdf8"
              icon="🎯"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;