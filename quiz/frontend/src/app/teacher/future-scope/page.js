"use client"
import { useState } from "react"

export default function FutureScopeUpload() {
  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [marks, setMarks] = useState([{ examType: "", score: "", maxScore: "" }])
  const [upcomingExams, setUpcomingExams] = useState([{ examType: "", maxScore: "" }])
  const [gradeThresholds, setGradeThresholds] = useState({
    O: 90,
    "A+": 80,
    A: 70,
    "B+": 60,
    B: 50,
    C: 40,
    F: 30,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleMarksChange = (i, field, value) => {
    const updated = [...marks]
    if (field === "score" || field === "maxScore") {
      let num = Number.parseInt(value)
      if (isNaN(num)) num = ""
      else num = Math.min(Math.max(num, 0), 100) // restrict to 0-100

      if (field === "score") {
        const max = updated[i].maxScore !== "" ? Number.parseInt(updated[i].maxScore) : 100
        updated[i][field] = Math.min(num, max) // score ≤ max
      } else {
        updated[i][field] = num
        // Also ensure score ≤ new maxScore
        if (updated[i].score > num) {
          updated[i].score = num
        }
      }
    } else {
      updated[i][field] = value
    }
    setMarks(updated)
  }

  const handleUpcomingChange = (i, field, value) => {
    const updated = [...upcomingExams]
    if (field === "maxScore") {
      const num = Number.parseInt(value)
      updated[i][field] = isNaN(num) ? "" : Math.min(Math.max(num, 0), 100)
    } else {
      updated[i][field] = value
    }
    setUpcomingExams(updated)
  }

  const isMarkEntryFilled = (m) => m.examType && m.score !== "" && m.maxScore !== ""
  const isUpcomingEntryFilled = (u) => u.examType && u.maxScore !== ""

  const addMarkEntry = () => {
    if (isMarkEntryFilled(marks[marks.length - 1])) {
      setMarks([...marks, { examType: "", score: "", maxScore: "" }])
    }
  }

  const addUpcomingEntry = () => {
    if (isUpcomingEntryFilled(upcomingExams[upcomingExams.length - 1])) {
      setUpcomingExams([...upcomingExams, { examType: "", maxScore: "" }])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setSuccess("")
    setError("")

    try {
      const res = await fetch("http://localhost:5005/api/v1/student-score/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId, marks, upcomingExams, gradeThresholds }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Something went wrong")
      setSuccess("📌 Student data successfully submitted!")
    } catch (err) {
      setError(err.message || "Error submitting data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-3 rounded-full shadow-md mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
            Upload Student Progress
          </h1>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-blue-100 space-y-8">
          {/* Student & Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Student ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="e.g., Srinidhi"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">Course ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="e.g., DS"
                />
              </div>
            </div>
          </div>

          {/* Past Marks Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <span className="text-xl">📝</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Marks for Completed Exams</h2>
            </div>

            <div className="space-y-4">
              {marks.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Exam Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Midterm"
                      value={m.examType}
                      onChange={(e) => handleMarksChange(i, "examType", e.target.value)}
                      className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Score</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Score"
                        value={m.score}
                        min={0}
                        max={m.maxScore || 100}
                        onChange={(e) => handleMarksChange(i, "score", e.target.value)}
                        className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                      />
                      <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-200">
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => {
                            const currentValue = m.score === "" ? 0 : Number.parseInt(m.score)
                            const maxValue = m.maxScore === "" ? 100 : Number.parseInt(m.maxScore)
                            if (currentValue < maxValue) {
                              handleMarksChange(i, "score", currentValue + 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-t border-gray-200"
                          onClick={() => {
                            const currentValue = m.score === "" ? 0 : Number.parseInt(m.score)
                            if (currentValue > 0) {
                              handleMarksChange(i, "score", currentValue - 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-28">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Max Score</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max"
                        value={m.maxScore}
                        min={0}
                        max={100}
                        onChange={(e) => handleMarksChange(i, "maxScore", e.target.value)}
                        className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                      />
                      <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-200">
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => {
                            const currentValue = m.maxScore === "" ? 0 : Number.parseInt(m.maxScore)
                            if (currentValue < 100) {
                              handleMarksChange(i, "maxScore", currentValue + 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-t border-gray-200"
                          onClick={() => {
                            const currentValue = m.maxScore === "" ? 0 : Number.parseInt(m.maxScore)
                            if (currentValue > 0) {
                              handleMarksChange(i, "maxScore", currentValue - 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMarkEntry}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Another Exam
            </button>
          </div>

          {/* Upcoming Exams Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <span className="text-xl">📅</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Upcoming Exams</h2>
            </div>

            <div className="space-y-4">
              {upcomingExams.map((u, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Exam Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Final"
                      value={u.examType}
                      onChange={(e) => handleUpcomingChange(i, "examType", e.target.value)}
                      className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-full md:w-28">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Max Score</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max"
                        value={u.maxScore}
                        min={0}
                        max={100}
                        onChange={(e) => handleUpcomingChange(i, "maxScore", e.target.value)}
                        className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                      />
                      <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-200">
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                          onClick={() => {
                            const currentValue = u.maxScore === "" ? 0 : Number.parseInt(u.maxScore)
                            if (currentValue < 100) {
                              handleUpcomingChange(i, "maxScore", currentValue + 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-t border-gray-200"
                          onClick={() => {
                            const currentValue = u.maxScore === "" ? 0 : Number.parseInt(u.maxScore)
                            if (currentValue > 0) {
                              handleUpcomingChange(i, "maxScore", currentValue - 1)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addUpcomingEntry}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Another Upcoming Exam
            </button>
          </div>

          {/* Grade Thresholds */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <span className="text-xl">🎯</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Grade Thresholds</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(gradeThresholds).map(([grade, value]) => (
                <div key={grade} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade {grade}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value}
                      min={0}
                      max={100}
                      onChange={(e) =>
                        setGradeThresholds({
                          ...gradeThresholds,
                          [grade]: Math.min(Math.max(Number.parseInt(e.target.value) || 0, 0), 100),
                        })
                      }
                      className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-200">
                      <button
                        className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                        onClick={() => {
                          const currentValue = value
                          if (currentValue < 100) {
                            setGradeThresholds({ ...gradeThresholds, [grade]: currentValue + 1 })
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="h-1/2 px-2 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-t border-gray-200"
                        onClick={() => {
                          const currentValue = value
                          if (currentValue > 0) {
                            setGradeThresholds({ ...gradeThresholds, [grade]: currentValue - 1 })
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-white font-semibold transition transform hover:scale-[1.02] active:scale-[0.98] ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
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
                Submitting...
              </span>
            ) : (
              "Submit Student Data"
            )}
          </button>

          {/* Feedback */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 font-medium text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 font-medium text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}