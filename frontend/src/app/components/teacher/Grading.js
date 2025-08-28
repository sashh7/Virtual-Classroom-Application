"use client";

export default function Grading({ setActiveSection }) {
  const studentSubmissions = [
    { id: 1, name: "Alice Johnson", course: "Mathematics", assignment: "Algebra Homework", status: "Not Graded" },
    { id: 2, name: "Bob Smith", course: "Physics", assignment: "Physics Lab Report", status: "Graded (B+)" },
    { id: 3, name: "Charlie Davis", course: "Chemistry", assignment: "Organic Chemistry Test", status: "Not Graded" },
  ];

  return (
    <div className="bg-[#23273D] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📊 Grading</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#3B3F58] text-white">
            <th className="p-2">Student Name</th>
            <th className="p-2">Course</th>
            <th className="p-2">Assignment</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {studentSubmissions.map((submission) => (
            <tr key={submission.id} className="border-b border-gray-600">
              <td className="p-2">{submission.name}</td>
              <td className="p-2">{submission.course}</td>
              <td className="p-2">{submission.assignment}</td>
              <td className={`p-2 ${submission.status.includes("Graded") ? "text-green-400" : "text-red-400"}`}>
                {submission.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        onClick={() => setActiveSection("Home")}
      >
        Back
      </button>
    </div>
  );
}
