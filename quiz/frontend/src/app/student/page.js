"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchQuizzes } from "../utils/api"
import { Clock, HelpCircle } from "lucide-react"

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const data = await fetchQuizzes()
        setQuizzes(data)
      } catch (error) {
        console.error("Failed to load quizzes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadQuizzes()
  }, [])

  return (
    <main className="w-full min-h-screen bg-[#1a1d2d] text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Student Dashboard</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center p-8 bg-[#232538] rounded-lg border border-gray-700 shadow-md">
          <p className="text-lg text-gray-300">No quizzes available at the moment.</p>
          <p className="mt-2 text-sm text-gray-400">Check back later for new quizzes.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="border border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-[#232538]"
            >
              <div className="bg-[#1e2030] p-4 border-b border-gray-700">
                <h3 className="font-semibold text-xl text-white">{quiz.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {quiz.totalTime} minutes
                  </span>
                  <span className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {quiz.questions?.length || 0} questions
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {quiz.description || "Take this quiz to test your knowledge."}
                </p>
                <Link
                  href={`/quiz/view/${quiz._id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Start Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

