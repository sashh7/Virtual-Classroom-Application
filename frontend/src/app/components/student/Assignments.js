"use client";

import { useRef } from "react";

export default function Assignments({ course, assignments }) {
  const handleAssignmentSubmit = async (assignmentId, file) => {
    try {
      console.log("Submitting Assignment ID:", assignmentId);


      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", file);

      const token = localStorage.getItem("token"); // Retrieve token from localStorage

      const response = await fetch(
        "http://localhost:5001/api/v1/student/assignment/submit",
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Assignment submitted successfully!");
        console.log(result);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to submit assignment.");
    }
  };

  const getStatus = (status) => {
    if (status === "Submitted")
      return { text: "Submitted", className: "text-green-500 font-bold" };
    return { text: "Pending", className: "text-red-500 font-bold" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{course} Assignments</h2>

      {assignments && assignments.length > 0 ? (
        assignments.map((assignment) => {
          console.log(
            "Rendering Assignment ID:",
            assignment._id || assignment.id
          );
          const fileInputRef = useRef(null);
          const { text, className } = getStatus(assignment.status);

          return (
            <div
              key={assignment._id || assignment.id}
              className="bg-[#23273D] p-4 rounded-lg shadow-md mb-4 flex justify-between items-center relative"
            >
              {/* Status in Top-Right Corner */}
              <div className={`absolute top-4 right-4 ${className}`}>
                {text}
              </div>

              <div>
                <h3 className="font-bold text-lg">{assignment.title}</h3>
                <p className="text-[#fe99e8] font-medium">
                  Due: {assignment.dueDate}
                </p>
                <p className="italic text-gray-300">
                  {assignment.instructions}
                </p>

                <a href="#" className="text-blue-400 underline">
                  Download Related Files
                </a>

                {assignment.status === "Pending" && (
                  <div className="mt-4 flex items-center gap-4">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      id={`file-${assignment._id || assignment.id}`}
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          handleAssignmentSubmit(
                            assignment._id || assignment.id,
                            e.target.files[0]
                          );
                        }
                      }}
                    />

                    {/* Custom Upload Button */}
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Upload
                    </button>
                  </div>
                )}

                {/* Show uploaded file with correct public URL */}
                {assignment.file && (
                  <div className="mt-2">
                    <a
                      href={`http://localhost:5001${assignment.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400"
                    >
                      Preview Uploaded File
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400 text-center font-semibold">
          No Assignments
        </p>
      )}
    </div>
  );
}
