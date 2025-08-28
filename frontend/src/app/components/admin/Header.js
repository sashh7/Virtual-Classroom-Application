"use client";

import { FaSignOutAlt, FaBars } from "react-icons/fa";

export default function Header({ sidebarOpen, setSidebarOpen, student, teacher, onLogout }) {
  const user = student || teacher; 

  return (
    <div className="w-full bg-[#1E2235] p-6 flex justify-between items-center shadow-md fixed top-0 left-0 z-50">
      {/* Sidebar Toggle Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(prev => !prev)} 
          className="text-3xl font-bold px-2 py-1 bg-[#2b2d4c] rounded-lg"
        >
          <FaBars />
        </button>
        <span className="text-4xl font-bold tracking-wide uppercase">
          LEARNIFY
        </span>
      </div>

      {/* User Info (Student or Teacher) */}
      <div className="flex items-center gap-4">
        <img
          src={user?.image || "/images/default-profile.png"}  // Fallback image
          alt="User"
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <span className="text-lg">{user?.name || "Guest"}</span>
        <button
          className="text-gray-400 text-2xl hover:text-white"
          onClick={onLogout}
        >
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
}
