"use client";

import {
  FaHome,
  FaBook,
  FaUser,
  FaComments,
  FaCalendarAlt,
} from "react-icons/fa";

export default function Sidebar({
  selectedCourse,
  setSelectedCourse,
  activeSection,
  setActiveSection,
  sidebarOpen,
}) {
  const quickLinks = [
    { name: "Home", icon: <FaHome />, section: "Home" },
    { name: "Profile", icon: <FaUser />, section: "Profile" },
    { name: "Chat", icon: <FaComments />, section: "Chat" },
    { name: "Schedule", icon: <FaCalendarAlt />, section: "Schedule" },
  ];

  const courses = ["Mathematics", "Physics", "Chemistry", "Biology"];

  return (
    <div
      className={`absolute left-0 top-24 bg-[#181B2A] p-6 rounded-2xl shadow-lg w-64 flex flex-col gap-6 transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold mb-2 text-gray-300 uppercase">
          Quick Links
        </h2>
        <div className="flex flex-col gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.name}
              className={`flex items-center gap-3 p-3 rounded-lg w-full text-left text-lg transition duration-200 
                ${
                  activeSection === link.section
                    ? "bg-[#5843d3] text-white shadow-lg"
                    : "text-gray-300 bg-[#222539] hover:bg-[#4C4F6B]"
                }`}
              onClick={() => setActiveSection(link.section)}
            >
              {link.icon}
              {link.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-lg font-bold mb-2 text-gray-300 uppercase">
          Courses
        </h2>
        <div className="flex flex-col gap-2">
          {courses.map((course) => (
            <button
              key={course}
              className={`p-3 rounded-lg w-full text-left text-lg transition duration-200 flex items-center gap-2
                ${
                  selectedCourse === course
                    ? "bg-[#5843d3] text-white shadow-lg"
                    : "text-gray-300 bg-[#222539] hover:bg-[#4C4F6B]"
                }`}
              onClick={() => {
                setSelectedCourse(course);
                setActiveSection("CourseActions");
              }}
            >
              <FaBook />
              {course}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
