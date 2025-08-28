"use client";
import Schedule from "./Schedule";  // Make sure this path is correct
import { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "./Sidebar";
import CourseActions from "./CourseActions";
import Assignments from "./Assignments";
import Profile from "./Profile";
import Resources from "./Resources";
import ChatApp from "./ChatApp";
import { useRouter } from "next/navigation";
import axios from 'axios';
// Utility function to format date and time
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("en-US", options);
};

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeSection, setActiveSection] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState({});
  const [assignmentStatus, setAssignmentStatus] = useState({});
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  // Load user from localStorage if not already set
  useEffect(() => {
    if (!student) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setStudent(JSON.parse(storedUser));
      }
    }
  }, [student]);
  // Add this import at the top

// Inside your useEffect
useEffect(() => {
  const fetchCourses = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.rollno) {  // Check if the user is a student
      try {
        const response = await axios.get(
          `http://localhost:5001/api/v1/admin/courses/student/${user.rollno}`
        );

        if (response.data && response.data.success && Array.isArray(response.data.courses)) {
          console.log("Courses being passed to Sidebar:", response.data.courses);
          setCourses(response.data.courses);  // Store fetched courses in state
        } else {
          console.error("Fetched data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
  };

  fetchCourses();  // Call the function inside useEffect
}, []);



useEffect(() => {
  async function fetchAssignments() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/v1/student/assignments", {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const filteredAssignments = data.filter((assignment) => {
          const relatedCourse = courses.find((course) => course.title === assignment.subject);

          // Check if the student's rollno exists in the students array of the related course
          if (relatedCourse && relatedCourse.students.some(student => student.rollno === student?.rollno)) {
            return true;  // Keep the assignment if the student is enrolled in the course
          }
          return false;  // Discard the assignment otherwise
        });

        const grouped = filteredAssignments.reduce((acc, assignment) => {
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
}, [courses, student]);  // Dependencies added to make sure we have the latest courses and student info



  const handleFileUpload = async (event, assignmentId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const name = student?.name;
    const rollno = student?.rollno;

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
        window.location.reload();
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  console.log("Courses being passed to Sidebar:", courses);

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
          courses={courses || []} 
        />
        <div className="flex-1 p-6 transition-all duration-300">
          {activeSection === "Home" && (
            <div>
              <h2 className="text-2xl font-bold mb-4"> Pending Assignments</h2>
              {Object.keys(assignments).length === 0 ? (
                <p className="text-gray-400 text-center font-semibold">
                  No Pending Assignments
                </p>
              ) : (
                Object.keys(assignments).map((courseKey) => {
                  const filteredAssignments = assignments[courseKey].filter(
                    (assignment) => {
                      if (!student) return true;
                      if (
                        !assignment.submittedFiles ||
                        assignment.submittedFiles.length === 0
                      )
                        return true;
                      return !assignment.submittedFiles.some(
                        (submission) => submission.studentName === student?.name
                      );
                    }
                  );

                  if (filteredAssignments.length === 0) return null;

                  return (
                    <div key={courseKey} className="mb-6">
                      <h3 className="font-bold text-lg mb-2">{courseKey}</h3>
                      {filteredAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="bg-[#23273D] p-4 rounded-lg shadow-md mb-4"
                        >
                          <h3 className="font-bold text-xl mb-1">
                            {assignment.title} ({assignment.subject})
                          </h3>
                          <p className="text-[#fe99e8] mb-1">
                            Due: {formatDateTime(assignment.duedate)}
                          </p>

                          {/* Show Related File if Exists */}
                          {assignment.relatedfile && (
    <div className="mb-2">
        <p className="text-sm text-gray-300 mb-1">Related File:</p>
        <a
            href={`http://localhost:5001${assignment.relatedfile}`} // Make sure you point to backend URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
        >
            Preview Related File
        </a>
    </div>
)}


                          <p className="text-sm mb-2">
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
                            onChange={(e) =>
                              handleFileUpload(e, assignment._id)
                            }
                            className="mt-2 text-sm bg-gray-700 p-2 rounded cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })
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
            <Resources course={selectedCourse} />
          )}
          {activeSection === "Profile" && student && <Profile student={student} />}
          {activeSection === "Chat" && <ChatApp />}
          {activeSection === "Schedule" && student && (
    <Schedule studentId={student.rollno} courses={courses} />
)}


        </div>
      </div>
    </div>
  );
}
