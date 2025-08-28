"use client"
/*
import { useState } from "react"
import { useRouter } from "next/navigation"
import QuestionForm from "./component/QuestionForm"
import { createQuiz, createQuestion, updateQuiz, deleteQuiz } from "./utils/api"
import { AlertCircle, CheckCircle, Clock, Eye, Trash2 } from "lucide-react"

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
    <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 border-b border-border/60">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground">
            {quizCreated ? "Add Questions to Quiz" : "Create a New Quiz"}
          </h1>
          <p className="text-center text-muted-foreground mt-2 max-w-xl mx-auto">
            {quizCreated
              ? "Add multiple questions to your quiz. You can publish when you're ready."
              : "Fill out the form below to create a new quiz for your students."}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {!quizCreated ? (
            <form onSubmit={handleQuizCreate} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground flex items-center">
                  Quiz Title <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter quiz title"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  value={quizData.title}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="teacherId" className="text-sm font-medium text-foreground flex items-center">
                  Teacher ID <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="teacherId"
                  type="text"
                  placeholder="Enter your teacher ID"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  value={quizData.teacherId}
                  onChange={(e) => setQuizData({ ...quizData, teacherId: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="totalTime" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Total Time (minutes)
                  </label>
                  <input
                    id="totalTime"
                    type="number"
                    min="1"
                    max="180"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                    value={quizData.totalTime}
                    onChange={(e) => setQuizData({ ...quizData, totalTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="resultsVisible"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-indigo-500" />
                    Results Visibility
                  </label>
                  <select
                    id="resultsVisible"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
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
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Quiz"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900/50 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-medium text-green-800 dark:text-green-400">
                    Quiz Created Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    Quiz ID:{" "}
                    <span className="font-mono bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded text-xs">
                      {quizId}
                    </span>
                  </p>
                </div>
              </div>

              <QuestionForm onAdd={handleAddQuestion} />

              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    Questions Added
                    <span className="ml-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {questions.length}
                    </span>
                  </h3>
                </div>

                {questions.length === 0 ? (
                  <div className="bg-muted/50 p-8 rounded-lg border border-border/60 text-center">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No questions have been added yet.</p>
                    <p className="text-sm text-muted-foreground/80 mt-2 max-w-md mx-auto">
                      Use the form above to add questions to your quiz. You need at least one question to publish.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div
                        key={q._id}
                        className="bg-card border border-border/80 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="bg-muted/70 px-4 py-3 border-b border-border/60 flex justify-between items-center">
                          <span className="font-medium text-foreground">Question {index + 1}</span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium
                            ${
                              q.type === "MULTIPLE_CHOICE"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : q.type === "SINGLE_CHOICE"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                          >
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
                            <div className="mt-3 pl-4">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                                Options:
                              </p>
                              <ul className="space-y-1.5">
                                {q.options.map((opt, i) => (
                                  <li
                                    key={i}
                                    className={`flex items-center text-sm ${
                                      opt.isCorrect
                                        ? "text-green-600 dark:text-green-400 font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                        opt.isCorrect ? "bg-green-500" : "bg-muted-foreground/40"
                                      }`}
                                    ></span>
                                    {opt.text}
                                    {opt.isCorrect && (
                                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-1.5 py-0.5 rounded">
                                        Correct
                                      </span>
                                    )}
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border mt-8">
                <button
                  type="button"
                  onClick={handleFinishQuiz}
                  disabled={isSubmitting || questions.length === 0}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    "Finish & Publish Quiz"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteQuiz}
                  disabled={isSubmitting}
                  className="sm:flex-initial bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
*/