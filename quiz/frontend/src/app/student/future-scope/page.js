"use client"
import { useState } from "react"

export default function FutureScope() {
  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [loading, setLoading] = useState(false)
  const [gradeData, setGradeData] = useState(null)
  const [error, setError] = useState("")

  const handleCheck = async () => {
    if (!studentId || !courseId) {
      setError("⚠️ Please enter both Student ID and Course ID.")
      return
    }

    setLoading(true)
    setError("")
    setGradeData(null)

    try {
      const res = await fetch(`http://localhost:5005/api/v1/student-score/${studentId}/${courseId}`)
      if (!res.ok) throw new Error("No data found. Please check the IDs.")
      const data = await res.json()
      setGradeData(data)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-8 border border-purple-100">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-purple-100 p-3 rounded-full mr-3">
            <span className="text-3xl">🎯</span>
          </div>
          <h2 className="text-3xl font-bold text-purple-800 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
            Student Grade Forecast
          </h2>
        </div>

        <div className="space-y-6">
          {/* Student ID Input */}
          <div className="group">
            <label className="block font-medium text-gray-700 mb-2 transition group-focus-within:text-purple-600">
              Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID"
              />
            </div>
          </div>

          {/* Course ID Input */}
          <div className="group">
            <label className="block font-medium text-gray-700 mb-2 transition group-focus-within:text-purple-600">
              Course ID
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Enter Course ID"
              />
            </div>
          </div>

          {/* Check Progress Button */}
          <button
            onClick={handleCheck}
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-white font-semibold transition transform hover:scale-[1.02] active:scale-[0.98] ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Check Progress"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 font-medium text-center mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Grade Data Display */}
          {gradeData && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Required Marks</h3>
              </div>

              <ul className="space-y-3">
                {Object.entries(gradeData.requiredMarks).map(([grade, mark]) => (
                  <li
                    key={grade}
                    className="flex justify-between p-4 rounded-lg shadow-sm border border-gray-100 hover:border-purple-200 transition bg-white"
                  >
                    <span className="font-semibold text-gray-800">{grade}</span>
                    <span
                      className={`font-medium ${
                        mark === "Already passed" || mark === "Already achieved" ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {mark === "Already passed"
                        ? "✅ Already passed"
                        : mark === "Already achieved"
                          ? "✅ Achieved"
                          : mark}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Upcoming Exams */}
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Upcoming Exams</h4>
                </div>

                {gradeData.upcomingExams.length > 0 ? (
                  <ul className="space-y-3">
                    {gradeData.upcomingExams.map((exam, i) => (
                      <li
                        key={i}
                        className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                      >
                        <span className="font-semibold text-indigo-800">{exam.examType}</span>
                        <span className="text-gray-700"> : Maximum Score possible is </span>
                        <span className="font-semibold text-purple-700">{exam.maxScore}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    No upcoming exams found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

