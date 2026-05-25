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
    <div className="glass-card gradient-border p-6 md:p-8 flex flex-col gap-6 animate-fade-in-scale h-full">
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Global Leaderboard
        </h2>
        <p className="text-sm text-gray-500">Top developers by coding score.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No leaders yet. Be the first to solve a challenge!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaders.map((user, index) => (
              <div 
                key={user._id} 
                className={\`flex items-center gap-4 p-3 rounded-xl border \${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 
                  index === 1 ? 'bg-gray-300/10 border-gray-400/30 shadow-[0_0_15px_rgba(156,163,175,0.1)]' : 
                  index === 2 ? 'bg-amber-700/10 border-amber-700/30 shadow-[0_0_15px_rgba(180,83,9,0.1)]' : 
                  'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/60'
                } transition-all duration-300 hover:scale-[1.02]\`}
              >
                <div className={\`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm \${
                  index === 0 ? 'bg-yellow-500 text-yellow-900' : 
                  index === 1 ? 'bg-gray-300 text-gray-800' : 
                  index === 2 ? 'bg-amber-600 text-amber-900' : 
                  'bg-gray-700 text-gray-300'
                }\`}>
                  #{index + 1}
                </div>
                
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-600" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-200 truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">
                      {user.score || 0} pts
                    </span>
                  </div>
                </div>

                {index === 0 && <span className="text-2xl" title="1st Place">👑</span>}
                {index === 1 && <span className="text-xl" title="2nd Place">🥈</span>}
                {index === 2 && <span className="text-xl" title="3rd Place">🥉</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
