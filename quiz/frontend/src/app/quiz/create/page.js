"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import QuestionForm from "../../../app/component/QuestionForm"
import { createQuiz, createQuestion, updateQuiz, deleteQuiz } from "../../../app/utils/api"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function CreateQuizPage() {
  const router = useRouter()
  const [quizCreated, setQuizCreated] = useState(false)
  const [quizId, setQuizId] = useState(null)
  const [quizData, setQuizData] = useState({
    title: "",
    teacherId: "",
    totalTime: 30,
    resultsVisible: "IMMEDIATE",
  })
  const [questions, setQuestions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuizCreate = async (e) => {
    e.preventDefault()
    if (!quizData.title.trim() || !quizData.teacherId.trim()) {
      alert("Quiz title and Teacher ID are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...quizData,
        totalTime: Number(quizData.totalTime),
        questions: [],
      }

      const result = await createQuiz(payload)
      if (!result || !result.quiz) {
        alert("Failed to create quiz.")
        return
      }

      setQuizId(result.quiz._id)
      setQuizCreated(true)
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("An error occurred while creating the quiz.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddQuestion = async (questionPayload) => {
    if (!quizId) {
      alert("Quiz must be created first!")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        quizId,
        ...questionPayload,
      }

      const res = await createQuestion(payload)
      if (!res || !res.question) {
        alert("Failed to add question.")
        return
      }

      setQuestions([...questions, res.question])
    } catch (error) {
      console.error("Error adding question:", error)
      alert("An error occurred while adding the question.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinishQuiz = async () => {
    if (!quizId) {
      alert("No quiz found to finalize!")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateQuiz(quizId, { status: "PUBLISHED" })
      if (!result || !result.quiz) {
        alert("Failed to finalize quiz.")
        return
      }

      alert("Quiz finalized successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error finalizing quiz:", error)
      alert("An error occurred while finalizing the quiz.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuiz = async () => {
    if (!quizId || !confirm("Are you sure you want to delete this quiz?")) return

    setIsSubmitting(true)
    try {
      const result = await deleteQuiz(quizId)
      if (!result || !result.success) {
        alert("Failed to delete quiz.")
        return
      }

      setQuizCreated(false)
      setQuizId(null)
      setQuestions([])
      setQuizData({ title: "", teacherId: "", totalTime: 30, resultsVisible: "IMMEDIATE" })
    } catch (error) {
      console.error("Error deleting quiz:", error)
      alert("An error occurred while deleting the quiz.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 text-white">
      <div className="bg-[#1a1d2e] rounded-xl shadow-md border border-[#2a2d3e] overflow-hidden">
        <div className="bg-gradient-to-r from-[#6247aa]/20 to-[#6247aa]/30 p-6 border-b border-[#2a2d3e]">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-200">
            {quizCreated ? "Add Questions to Quiz" : "Create a New Quiz"}
          </h1>
        </div>

        <div className="p-6">
          {!quizCreated ? (
            <form onSubmit={handleQuizCreate} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Quiz Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter quiz title"
                  className="w-full px-4 py-3 rounded-md border border-[#2a2d3e] bg-[#252836] text-white focus:outline-none focus:ring-2 focus:ring-[#6247aa]/50 focus:border-[#6247aa] transition-colors"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="teacherId" className="text-sm font-medium text-foreground">
                  Teacher ID
                </label>
                <input
                  id="teacherId"
                  type="text"
                  placeholder="Enter your teacher ID"
                  className="w-full px-4 py-3 rounded-md border border-[#2a2d3e] bg-[#252836] text-white focus:outline-none focus:ring-2 focus:ring-[#6247aa]/50 focus:border-[#6247aa] transition-colors"
                  value={quizData.teacherId}
                  onChange={(e) => setQuizData({ ...quizData, teacherId: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="totalTime" className="text-sm font-medium text-foreground">
                    Total Time (minutes)
                  </label>
                  <input
                    id="totalTime"
                    type="number"
                    min="1"
                    max="180"
                    className="w-full px-4 py-3 rounded-md border border-[#2a2d3e] bg-[#252836] text-white focus:outline-none focus:ring-2 focus:ring-[#6247aa]/50 focus:border-[#6247aa] transition-colors"
                    value={quizData.totalTime}
                    onChange={(e) => setQuizData({ ...quizData, totalTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="resultsVisible" className="text-sm font-medium text-foreground">
                    Results Visibility
                  </label>
                  <select
                    id="resultsVisible"
                    className="w-full px-4 py-3 rounded-md border border-[#2a2d3e] bg-[#252836] text-white focus:outline-none focus:ring-2 focus:ring-[#6247aa]/50 focus:border-[#6247aa] transition-colors"
                    value={quizData.resultsVisible}
                    onChange={(e) => setQuizData({ ...quizData, resultsVisible: e.target.value })}
                  >
                    <option value="IMMEDIATE">Show Marks Immediately</option>
                    <option value="AFTER_SUBMISSION">Show Marks After Submission</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#6247aa] hover:bg-[#7355c7] text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-90 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Quiz"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center p-4 bg-[#6247aa]/10 border border-[#6247aa]/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-[#a992e2]">Quiz Created Successfully</h3>
                  <p className="text-sm text-[#9580d1] mt-1">Quiz ID: {quizId}</p>
                </div>
              </div>

              <QuestionForm onAdd={handleAddQuestion} />

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Questions Added ({questions.length})</h3>
                </div>

                {questions.length === 0 ? (
                  <div className="bg-[#252836] p-6 rounded-lg border border-[#2a2d3e] text-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No questions have been added yet.</p>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      Use the form above to add questions to your quiz.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div
                        key={q._id}
                        className="bg-[#252836] border border-[#2a2d3e] rounded-lg overflow-hidden shadow-sm"
                      >
                        <div className="bg-[#1e2130] px-4 py-2 border-b border-[#2a2d3e] flex justify-between items-center">
                          <span className="font-medium">Question {index + 1}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-[#6247aa]/20 text-[#a992e2] font-medium">
                            {q.type === "MULTIPLE_CHOICE"
                              ? "Multiple Choice"
                              : q.type === "SINGLE_CHOICE"
                                ? "Single Choice"
                                : "Fill in the Blank"}
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="font-medium text-foreground">{q.questionText}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-2 pl-4">
                              <p className="text-xs text-muted-foreground mb-1">Options:</p>
                              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                {q.options.map((opt, i) => (
                                  <li key={i} className={opt.isCorrect ? "text-[#a992e2] font-medium" : ""}>
                                    {opt.text} {opt.isCorrect && "(Correct)"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleFinishQuiz}
                  disabled={isSubmitting || questions.length === 0}
                  className="flex-1 bg-[#6247aa] hover:bg-[#7355c7] text-white px-4 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-90 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Publishing..." : "Finish & Publish Quiz"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

