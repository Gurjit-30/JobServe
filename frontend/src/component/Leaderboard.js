import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/leaderboard");
      setLeaders(res.data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in-scale h-full">
      <div className="flex flex-col gap-1 border-b border-[#21262d] pb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#00e5a0] to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
          <svg className="w-6 h-6 text-[#00e5a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Global Leaderboard
        </h2>
        <p className="text-sm text-[#8b949e]">Top developers by coding score.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#21262d] text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Avatar</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2 text-right">Challenges</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#0d1117]/50 border border-[#21262d] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <svg className="w-16 h-16 text-[#21262d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-200">No leaders yet</h3>
            <p className="text-sm text-[#8b949e] mt-1">Solve a challenge to claim the #1 spot.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#21262d] text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Avatar</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2 text-right">Challenges</div>
            </div>
            {leaders.map((user, index) => (
              <div 
                key={user._id} 
                className={`grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-3 rounded-xl border ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 
                  index === 1 ? 'bg-gray-300/10 border-gray-400/30 shadow-[0_0_15px_rgba(156,163,175,0.1)]' : 
                  index === 2 ? 'bg-amber-700/10 border-amber-700/30 shadow-[0_0_15px_rgba(180,83,9,0.1)]' : 
                  'bg-[#0d1117] border-[#21262d] hover:border-[#00e5a0]/50'
                } transition-all duration-300 hover:scale-[1.02] group`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' : 
                    index === 1 ? 'bg-gray-300 text-gray-800' : 
                    index === 2 ? 'bg-amber-600 text-amber-900' : 
                    'bg-[#21262d] text-white'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center justify-center md:justify-start">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-[#21262d]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#00e5a0]/20 border border-[#00e5a0]/30 flex items-center justify-center text-sm font-bold text-[#00e5a0]">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="col-span-5 flex flex-col justify-center items-center md:items-start truncate">
                  <span className="font-semibold text-gray-200 truncate group-hover:text-[#00e5a0] transition-colors">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {index === 0 && <span className="text-sm" title="1st Place">👑</span>}
                    {index === 1 && <span className="text-sm" title="2nd Place">🥈</span>}
                    {index === 2 && <span className="text-sm" title="3rd Place">🥉</span>}
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-center md:justify-start">
                  <span className="text-sm font-mono text-[#00e5a0] font-bold bg-[#00e5a0]/10 px-2 py-1 rounded">
                    {user.score || 0} pts
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-center md:justify-end">
                  <span className="text-sm text-[#8b949e]">
                    {user.challengesSolved || Math.floor((user.score || 0)/10)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
