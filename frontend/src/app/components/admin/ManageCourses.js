import React, { useState } from 'react';

export default function ManageCourses() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [teacherID, setTeacherID] = useState('');

  const handleAddCourse = () => {
    // Handle the course addition logic here
    console.log('Course Added:', { courseTitle, courseDescription, teacherID });
  };

  return (
    <div className="bg-[#1b1c30] p-6 rounded-xl w-full">
      <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
        📚 Manage Courses
      </h2>

      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter course title"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          className="bg-[#222539] text-white p-3 rounded-lg focus:outline-none"
        />
        <textarea
          placeholder="Enter course description"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          className="bg-[#222539] text-white p-3 rounded-lg focus:outline-none h-28"
        />
        <input
          type="text"
          placeholder="Enter Teacher ID"
          value={teacherID}
          onChange={(e) => setTeacherID(e.target.value)}
          className="bg-[#222539] text-white p-3 rounded-lg focus:outline-none"
        />

        {/* Add Course Button */}
        <button
          onClick={handleAddCourse}
          className="bg-green-500 text-white py-2 px-6 mt-4 rounded-lg transition-all duration-200 hover:bg-green-600 shadow-lg"
        >
          Add Course
        </button>
      </div>

      <p className="text-gray-400">No courses available.</p>
    </div>
  );
}
