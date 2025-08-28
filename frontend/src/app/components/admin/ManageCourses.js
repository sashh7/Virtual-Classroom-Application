"use client";

import { useState, useEffect } from "react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [teacherId, setTeacherId] = useState(""); // 🔥 Store teacher ID input

  useEffect(() => {
    async function fetchCourses() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5001/api/v1/admin/courses",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
    fetchCourses();
  }, []);

  // ✅ Add a new course
  const addCourse = async () => {
    if (!newCourse.trim() || !courseDescription.trim() || !teacherId.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5001/api/v1/admin/courses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newCourse,
            description: courseDescription,
            teacherId: teacherId.trim(), // ✅ Send teacher ID manually
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourses([...courses, data.course]);
        setNewCourse("");
        setCourseDescription("");
        setTeacherId(""); // Clear input
      } else {
        console.error("Error adding course:", data.error);
      }
    } catch (error) {
      console.error("Add course error:", error);
    }
  };

  // ✅ Delete a course
  const deleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/v1/admin/courses/${courseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setCourses(courses.filter((course) => course._id !== courseId));
      } else {
        console.error("Error deleting course");
      }
    } catch (error) {
      console.error("Delete course error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 Manage Courses</h2>

      {/* Course Form */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter course title"
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
          className="p-2 border rounded text-black w-full mb-2"
        />
        <textarea
          placeholder="Enter course description"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          className="p-2 border rounded text-black w-full mb-2"
        ></textarea>

        {/* Teacher ID Input Field */}
        <input
          type="text"
          placeholder="Enter Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="p-2 border rounded text-black w-full mb-2"
        />

        <button
          onClick={addCourse}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Add Course
        </button>
      </div>

      {/* Course List */}
      <ul>
        {courses.length === 0 ? (
          <p className="text-gray-400">No courses available.</p>
        ) : (
          courses.map((course) => (
            <li
              key={course._id}
              className="flex justify-between bg-gray-800 p-3 mb-2 rounded"
            >
              <span>{course.title}</span>
              <button
                onClick={() => deleteCourse(course._id)}
                className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
