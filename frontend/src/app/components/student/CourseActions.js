"use client";

export default function CourseActions({ course, setActiveSection, activeSection }) {  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{course} Course Features</h2>
      <div className="grid grid-cols-2 gap-4">
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
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Quizzes"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Quizzes")}
        >
          Quizzes
        </button>
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Grades"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Grades")}
        >
          Grades
        </button>
        <button
          className={`p-4 rounded-lg transition ${
            activeSection === "Assignments"
              ? "bg-pink-500 text-white"
              : "bg-[#222539] text-white hover:bg-pink-500"
          }`}
          onClick={() => setActiveSection("Assignments")}
        >
          Assignments
        </button>
      </div>
    </div>
  );
}
