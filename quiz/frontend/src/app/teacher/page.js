"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchQuizzes, deleteQuiz } from "../utils/api"
import { PlusCircle, Clock, User, FileText, Edit, Eye, Trash2, AlertCircle } from "lucide-react"

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoading(true)
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

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteQuiz(quizId)
      setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error("Failed to delete quiz:", error)
    }
  }

  return (
    <main className="bg-[#1a1d2d] text-white min-h-screen p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-300">Manage your quizzes and view student results</p>
        </div>

        <Link
          href="/quiz/create"
          className="mt-4 md:mt-0 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-[#232538] border border-gray-700 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2a2d42] rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h2>
          <p className="text-gray-300 mb-6">
            You haven't created any quizzes yet. Get started by creating your first quiz.
          </p>
          <Link
            href="/quiz/create"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-[#232538] border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 border-b border-gray-700">
                <Link href={`/quiz/${quiz._id}`}>
                  <h3 className="font-semibold text-lg text-white hover:text-indigo-400 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                </Link>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{quiz.teacherId}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quiz.totalTime} minutes</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-300">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2030] px-5 py-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Link
                    href={`/quiz/${quiz._id}`}
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-[#2a2d42] rounded-md transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/quiz/edit/${quiz._id}`}
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-[#2a2d42] rounded-md transition-colors"
                    title="Edit Quiz"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setDeleteConfirm(quiz._id)}
                    className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-[#2a2d42] rounded-md transition-colors"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === quiz._id && (
                <div className="p-4 bg-red-900/30 border-t border-red-800">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-200 font-medium">Delete this quiz?</p>
                      <p className="text-xs text-red-300 mt-1 mb-2">This action cannot be undone.</p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="text-xs px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

