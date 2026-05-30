import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ user, handleSignOut }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Courses', path: '/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Interviews', path: '/interview/setup', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { name: 'Leaderboard', path: '/', icon: 'M9 19v-6a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h3a2 2 0 002-2zm0 0V9a2 2 0 012-2h3a2 2 0 012 2v10m-6 0a2 2 0 002 2h3a2 2 0 002-2m0 0V5a2 2 0 012-2h3a2 2 0 012 2v14a2 2 0 01-2 2h-3a2 2 0 01-2-2z', action: 'scroll' },
    { name: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#21262d] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#21262d]">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] rounded-md">
          <svg className="w-6 h-6 text-[#00e5a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xl font-bold bg-gradient-to-r from-[#00e5a0] to-teal-500 bg-clip-text text-transparent">Prepserve</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path && !link.action;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] ${
                isActive 
                  ? "bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20" 
                  : "text-[#8b949e] hover:text-white hover:bg-white/5 border border-transparent"
              }`}
              onClick={(e) => {
                if (link.action === 'scroll') {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    window.location.href = '/'; // Simple redirect to dashboard where leaderboard is
                  } else {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
              {link.name}
            </Link>
          );
        })}

        <div className="mt-8 mb-4 px-4 text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Settings
        </div>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8b949e] hover:text-[#f87171] hover:bg-[#f87171]/10 border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f87171] w-full text-left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Today's Progress Widget (Bottom of Sidebar) */}
      <div className="p-4 border-t border-[#21262d]">
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
            <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8b949e]">Today's Progress</div>
            <div className="text-sm font-bold text-white">2 Hours <span className="text-[#8b949e] font-normal">logged</span></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
