"use client";

export default function CourseActions({ course, setActiveSection, activeSection }) {  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{course} Management</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* View Assignments Button */}
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Assignments"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Assignments")}
        >
          View Assignments
        </button>

        {/* Create Assignment Button */}
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "CreateAssignment"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("CreateAssignment")}
        >
          Create Assignment
        </button>

        {/* Grading Button */}
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Grading"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Grading")}
        >
          Grading
        </button>

        {/* Resources Button  */}
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Resources"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Resources")}
        >
          Resources
        </button>
      </div>
    </div>
  );
}
