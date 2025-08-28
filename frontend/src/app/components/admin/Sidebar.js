"use client";

import { FaPlus, FaTrash, FaUserPlus } from "react-icons/fa";

export default function Sidebar({ sidebarOpen, setActiveSection }) {
  return (
    <div
      className={`absolute left-0 top-24 bg-[#181B2A] p-6 rounded-2xl shadow-lg w-64 flex flex-col gap-6 transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <h2 className="text-lg font-bold mb-2 text-gray-300 uppercase">Actions</h2>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setActiveSection('addCourse')}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-left text-lg text-gray-300 bg-[#222539] hover:bg-[#4C4F6B]"
        >
          <FaPlus /> Add Courses
        </button>

        <button
          onClick={() => setActiveSection('deleteCourse')}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-left text-lg text-gray-300 bg-[#222539] hover:bg-[#4C4F6B]"
        >
          <FaTrash /> Delete Course
        </button>

        <button
          onClick={() => setActiveSection('addStudent')}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-left text-lg text-gray-300 bg-[#222539] hover:bg-[#4C4F6B]"
        >
          <FaUserPlus /> Add Student to Course
        </button>
      </div>
    </div>
  );
  <button 
  onClick={() => setActiveSection('deleteCourse')}
  className={`flex items-center p-2 mb-2 rounded cursor-pointer text-white 
  ${activeSection === 'deleteCourse' ? 'bg-red-600' : 'bg-gray-700'}`}
>
  🗑️ Delete Course
</button>

}
