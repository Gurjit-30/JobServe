import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function TopHeader({ user, searchQuery, setSearchQuery }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative flex items-center">
          <svg className="w-5 h-5 text-[#8b949e] absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search skills, categories, goals..." 
            className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl h-10 pl-10 pr-4 text-sm text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus:ring-1 focus:ring-[#00e5a0] transition-all"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-[#8b949e] hover:text-white transition-colors duration-200 p-2 rounded-full focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus:outline-none"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>

        {/* Notifications */}
        <button className="text-[#8b949e] hover:text-white transition-colors duration-200 p-2 rounded-full focus-visible:ring-1 focus-visible:ring-[#00e5a0] focus:outline-none relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#00e5a0] rounded-full"></span>
        </button>

        {/* User Profile */}
        {user && (
          <Link to="/profile" className="flex items-center gap-3 pl-2 border-l border-[#21262d] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] rounded-full">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-[#21262d]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#00e5a0] border border-[#00e5a0]/30 flex items-center justify-center text-sm font-bold text-[#0d1117]">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">{user.name || user.email.split('@')[0]}</span>
              <span className="text-xs font-medium text-[#8b949e] leading-tight">{user.email}</span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

export default TopHeader;
