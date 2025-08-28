"use client";

import { FaEye, FaArrowLeft } from "react-icons/fa";

export default function Submissions({ assignment, setActiveSection }) {
  console.log("Assignment Details:", assignment); // Debugging log
  if (!assignment || !assignment.submittedFiles) {
    return (
      <div className="text-center text-gray-400 font-semibold">
        No submissions available.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        📄 {assignment.title} Submissions
      </h2>

      {/* Back Button */}
      <button
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition flex items-center gap-2"
         onClick={() => window.location.reload() }
      >
        <FaArrowLeft /> Back to Assignments
      </button>

      {/* Submissions Table */}
      <div className="bg-[#23273D] p-6 rounded-lg shadow-md">
        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="p-2">Student Name</th>
              <th className="p-2">Roll Number</th>
              <th className="p-2 text-center">Preview</th>
            </tr>
          </thead>
          <tbody>
            {assignment.submittedFiles.length > 0 ? (
              assignment.submittedFiles.map((submission, index) => (
                <tr key={index} className="border-b border-gray-500">
                  <td className="p-2">{submission.studentName || "Unknown"}</td>
                  <td className="p-2">{submission.rollNumber || "N/A"}</td>
                  <td className="p-2 text-center">
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1 justify-center hover:bg-blue-600 transition w-fit mx-auto"
                    >
                      <FaEye /> View
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-400">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
