"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { fetchQuizById } from "../../../app/utils/api"
import { ArrowLeft, Clock, User, Eye, FileQuestion } from "lucide-react"
import Link from "next/link"

export default function QuizDetails() {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname() // e.g. /quiz/64f8e12b
  const quizId = pathname.split("/").pop() // get last segment

  useEffect(() => {
    if (!quizId) return
    async function loadQuiz() {
      try {
        setLoading(true)
        const data = await fetchQuizById(quizId)
        setQuiz(data)
      } catch (error) {
        console.error("Failed to load quiz:", error)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [quizId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6247aa]"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-[#2a1a2e] border border-[#3d2a42] text-[#e1c5e9] p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
          <p className="mb-4">The quiz you're looking for doesn't exist or has been removed.</p>
          <Link href="/teacher" className="inline-flex items-center text-[#a992e2] hover:text-[#c4b5ea]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-white">
      <div className="mb-6">
        <Link
          href="/teacher"
          className="inline-flex items-center text-[#a992e2] hover:text-[#c4b5ea] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-[#1a1d2e] rounded-xl shadow-md overflow-hidden border border-[#2a2d3e]">
          <div className="bg-gradient-to-r from-[#6247aa]/20 to-[#6247aa]/30 p-6 border-b border-[#2a2d3e]">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{quiz.title}</h1>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-300">
                <User className="w-5 h-5 mr-2 text-[#a992e2]" />
                <span>
                  Teacher: <span className="font-medium">{quiz.teacherId}</span>
                </span>
              </div>

              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-2 text-[#a992e2]" />
                <span>
                  Duration: <span className="font-medium">{quiz.totalTime} minutes</span>
                </span>
              </div>

              <div className="flex items-center text-gray-300">
                <Eye className="w-5 h-5 mr-2 text-[#a992e2]" />
                <span>
                  Results: <span className="font-medium">{quiz.resultsVisible}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-4">
              <FileQuestion className="w-5 h-5 mr-2 text-[#a992e2]" />
              <h2 className="text-xl font-semibold text-white">Questions ({quiz.questions.length})</h2>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="bg-[#252836] rounded-lg p-8 text-center border border-[#2a2d3e]">
                <p className="text-gray-400">No questions have been added to this quiz yet.</p>
                <Link
                  href={`/quiz/edit/${quiz._id}`}
                  className="mt-4 inline-block text-[#a992e2] hover:text-[#c4b5ea] font-medium"
                >
                  Add Questions
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((q, index) => (
                  <div
                    key={q._id}
                    className="bg-[#252836] border border-[#2a2d3e] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="bg-[#1e2130] px-4 py-3 border-b border-[#2a2d3e] flex justify-between items-center">
                      <span className="font-medium text-gray-200">Question {index + 1}</span>
                      <span className="text-xs px-2 py-1 bg-[#6247aa]/20 text-[#a992e2] rounded-full">
                        {q.type === "MULTIPLE_CORRECT"
                          ? "Multiple Choice"
                          : q.type === "MCQ"
                            ? "Single Choice"
                            : "Fill in the Blank"}
                      </span>
                    </div>

                    <div className="p-4">
                      <p className="font-medium text-white mb-3">{q.questionText}</p>

                      {q.type === "FILL_IN_THE_BLANK" ? (
                        <div className="mt-3 bg-[#2a2d3e] p-3 rounded-md border border-[#3d3f4e]">
                          <p className="text-sm text-gray-300 mb-1">Correct Answer:</p>
                          <p className="font-semibold text-[#a992e2]">{q.correctAnswer}</p>
                        </div>
                      ) : (
                        <ul className="space-y-2 mt-2">
                          {q.options.map((opt, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start p-2 rounded-md ${
                                opt.isCorrect
                                  ? "bg-[#6247aa]/10 border border-[#6247aa]/30"
                                  : "bg-[#2a2d3e] border border-[#3d3f4e]"
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center mt-0.5 ${
                                  opt.isCorrect ? "bg-[#6247aa] text-white" : "bg-[#3d3f4e]"
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <p className={`${opt.isCorrect ? "font-medium text-[#a992e2]" : "text-gray-300"}`}>
                                  {opt.text}
                                </p>
                                {opt.isCorrect && <p className="text-xs text-[#9580d1] mt-1">Correct Answer</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

