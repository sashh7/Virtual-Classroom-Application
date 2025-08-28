"use client";

import { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "./Sidebar";
import CourseActions from "./CourseActions";
import Assignments from "./Assignments";
import Profile from "./Profile";
import Resources from "./Resources";
import ChatApp from "./ChatApp";

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeSection, setActiveSection] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState({});
  const [assignmentStatus, setAssignmentStatus] = useState({});
  const [student, setStudent] = useState(null);

  // Fetch Assignments
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5001/api/v1/student/assignments",
          {
            method: "GET",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const grouped = data.reduce((acc, assignment) => {
            const subject = assignment.subject || "General";
            if (!acc[subject]) acc[subject] = [];
            acc[subject].push(assignment);
            return acc;
          }, {});
          setAssignments(grouped);
        } else {
          console.error("Error fetching assignments:", data.error);
        }
      } catch (error) {
        console.error("Fetch assignments error:", error);
      }
    }
    fetchAssignments();
  }, []);

  // Fetch Student Profile
  useEffect(() => {
    async function fetchStudentProfile() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const name = user.name;
        const rollno = user.rollno;

        const response = await fetch(
          "http://localhost:5001/api/v1/student/profile",
          {
            method: "GET",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setStudent({ ...data, name, rollno });
        } else {
          console.error("Error fetching student profile:", data.error);
        }
      } catch (error) {
        console.error("Fetch student profile error:", error);
      }
    }
    fetchStudentProfile();
  }, []);

  // Handle File Upload
  const handleFileUpload = async (event, assignmentId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name;
    const rollno = user.rollno;

    formData.append("file", file);
    formData.append("name", name);
    formData.append("rollno", rollno);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/v1/student/assignment/submit/${assignmentId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        setAssignmentStatus((prev) => ({
          ...prev,
          [assignmentId]: "Submitted",
        }));
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="h-screen bg-[#1b1c30] text-white flex flex-col">
      <Header
        student={student}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div
        className={`flex flex-1 pt-24 transition-all duration-300 ${
          sidebarOpen ? "pl-64" : "pl-0"
        }`}
      >
        <Sidebar
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 p-6 transition-all duration-300">
          {activeSection === "Home" && (
            <div>
              <h2 className="text-xl font-bold mb-4">📌 Pending Assignments</h2>
              {Object.keys(assignments).length === 0 ? (
                <p className="text-gray-400 text-center font-semibold">
                  No Pending Assignments
                </p>
              ) : (
                Object.keys(assignments).map((course) => (
                  <div key={course} className="mb-6">
                    <h3 className="font-bold">{course}</h3>
                    {assignments[course].map((assignment) => (
                      <div
                        key={assignment._id}
                        className="bg-[#23273D] p-4 rounded-lg shadow-md mb-2"
                      >
                        <h3 className="font-bold">
                          {assignment.title} ({assignment.subject})
                        </h3>
                        <p className="text-[#fe99e8]">
                          Due: {assignment.duedate} {assignment.duetime}
                        </p>
                        <p className="text-sm mt-2">
                          Status:{" "}
                          <span
                            className={
                              assignmentStatus[assignment._id] === "Submitted"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {assignmentStatus[assignment._id] || "Pending"}
                          </span>
                        </p>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, assignment._id)}
                          className="mt-2 text-sm bg-gray-700 p-2 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
          {activeSection === "CourseActions" && selectedCourse && (
            <CourseActions
              course={selectedCourse}
              setActiveSection={setActiveSection}
              activeSection={activeSection}
            />
          )}
          {activeSection === "Assignments" && selectedCourse && (
            <Assignments
              course={selectedCourse}
              assignments={assignments[selectedCourse]}
            />
          )}
          {activeSection === "Resources" && selectedCourse && (
            <Resources
              course={selectedCourse}
              setActiveSection={setActiveSection}
            />
          )}
          {activeSection === "Profile" && student && (
            <Profile student={student} />
          )}
          {activeSection === "Chat" && <ChatApp />}
        </div>
      </div>
    </div>
  );
}
