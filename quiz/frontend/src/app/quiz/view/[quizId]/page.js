"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { startQuizAttempt, getQuestion, submitAnswer, submitQuizAttempt, getQuizResult } from "../../../utils/api"

export default function TakeQuizPage() {
  const [attemptId, setAttemptId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [quizTitle, setQuizTitle] = useState("")
  const [answers, setAnswers] = useState({}) // Store answers for each question

  const params = useParams()
  const quizId = params.quizId
  const router = useRouter()

  // Function to submit the current answer and move to next question
  const handleNext = useCallback(async () => {
    // For multiple choice, allow empty selections (user might want to skip)
    // For other question types, require an answer
    if (!["MCQ", "MULTIPLE_CORRECT"].includes(question.type) && !selectedOptions.length) {
      alert("Please select an answer!")
      return
    }

    try {
      setLoading(true)
      // Save the current answer
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: selectedOptions,
      }))

      // Submit the answer to the server
      await submitAnswer({ attemptId, questionId: question._id, selectedOptions })

      // Move to the next question
      if (currentIndex + 1 < totalQuestions) {
        const nextIndex = currentIndex + 1
        console.log("Moving to question index:", nextIndex)
        setCurrentIndex(nextIndex)

        try {
          const nextQuestion = await getQuestion(attemptId, nextIndex)
          console.log("Next question loaded:", nextQuestion)

          if (nextQuestion) {
            setQuestion(nextQuestion)
            // If we already have an answer for this question, use it
            setSelectedOptions(answers[nextIndex] || [])
          } else {
            console.error("Failed to load next question")
            setError("Failed to load the next question. Please try again.")
          }
        } catch (err) {
          console.error("Error loading next question:", err)
          setError("Failed to load the next question. Please try again.")
        }
      }
    } catch (err) {
      setError("Failed to submit answer. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [attemptId, currentIndex, question, selectedOptions, totalQuestions, answers])

  // Function to submit the entire quiz
  const handleSubmitQuiz = useCallback(async () => {
    // For multiple choice, allow empty selections
    // Example update in handleNext
    if (!["MCQ", "MULTIPLE_CORRECT"].includes(question.type) && !selectedOptions.length) {
      alert("Please select an answer!")
      return
    }

    try {
      setLoading(true)

      // Save the current answer
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: selectedOptions,
      }))

      // Submit the answer to the server
      await submitAnswer({ attemptId, questionId: question._id, selectedOptions })

      // Submit the entire quiz
      await submitQuizAttempt(attemptId)
      setQuizFinished(true)
      const result = await getQuizResult(attemptId)
      setScore(result?.score || "Pending")
    } catch (err) {
      setError("Failed to submit quiz. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [attemptId, currentIndex, question, selectedOptions])

  // Auto-submit when timer runs out
  const handleTimeUp = useCallback(async () => {
    try {
      await submitQuizAttempt(attemptId)
      setQuizFinished(true)
      const result = await getQuizResult(attemptId)
      setScore(result?.score || "Pending")
    } catch (err) {
      console.error("Error auto-submitting quiz:", err)
    }
  }, [attemptId])

  // Initialize quiz
  useEffect(() => {
    if (!quizId) return

    async function startQuiz() {
      try {
        setLoading(true)
        // In a real app, you'd get userId from authentication
        const userId = "srin" // Placeholder
        const attempt = await startQuizAttempt(userId, quizId)

        if (attempt) {
          setAttemptId(attempt._id)

          // Get quiz details
          const quiz = attempt.quizId || {}
          console.log("Quiz details:", quiz, "Total questions:", quiz.questions?.length)
          setQuizTitle(quiz.title || "Quiz")

          // Set timer based on quiz duration (convert minutes to seconds)
          const quizTime = quiz.totalTime || 30 // Default to 30 if not specified
          console.log("Setting quiz time to:", quizTime, "minutes")
          setTimeLeft(quizTime * 60)

          // Load first question
          const firstQuestion = await getQuestion(attempt._id, 0)
          if (firstQuestion) {
            setQuestion(firstQuestion)
            // Set total questions from the response or from quiz.questions length
            const questionCount = firstQuestion.totalQuestions || quiz.questions?.length || 1
            console.log("Setting total questions to:", questionCount)
            setTotalQuestions(questionCount)
          }
        }
      } catch (err) {
        setError("Failed to start quiz. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    startQuiz()
  }, [quizId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizFinished) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, quizFinished, handleTimeUp])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Save current answer before moving
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: selectedOptions,
      }))

      // Move to previous question
      setCurrentIndex(currentIndex - 1)
      getQuestion(attemptId, currentIndex - 1).then((q) => {
        setQuestion(q)
        // Load the previously selected answer if it exists
        setSelectedOptions(answers[currentIndex - 1] || [])
      })
    }
  }, [currentIndex, attemptId, selectedOptions, answers])

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-white">
        <div className="bg-[#2a1a2e] border border-[#3d2a42] text-[#e1c5e9] p-4 rounded-lg">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#6247aa] text-white rounded hover:bg-[#7355c7]"
            onClick={() => router.push("/student")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading && !question) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6247aa]"></div>
      </div>
    )
  }

  if (quizFinished) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white">
        <div className="bg-[#1a1d2e] rounded-lg shadow-md p-8 text-center border border-[#2a2d3e]">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6247aa]/20 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#a992e2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-400">You have successfully completed the quiz.</p>
          </div>

          <div className="bg-[#252836] rounded-lg p-6 mb-6 border border-[#2a2d3e]">
            <p className="text-lg">Your Score:</p>
            <p className="text-3xl font-bold text-[#a992e2]">{score}</p>
          </div>

          <button
            className="px-6 py-3 bg-[#6247aa] text-white rounded-lg hover:bg-[#7355c7] transition-colors"
            onClick={() => router.push("/student")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!question) return <p className="p-6 text-white">No questions available.</p>

  // Determine if this is the last question
  const isLastQuestion = currentIndex === totalQuestions - 1

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 text-white">
      <div className="bg-[#1a1d2e] rounded-lg shadow-md overflow-hidden border border-[#2a2d3e]">
        {/* Quiz header */}
        <div className="bg-[#252836] p-4 border-b border-[#2a2d3e] flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{quizTitle}</h2>
            <div className="text-sm text-gray-400">
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>

          {/* Timer - always show if timeLeft is set */}
          {timeLeft !== null && (
            <div
              className={`text-lg font-mono font-bold rounded-full px-4 py-2 ${
                timeLeft < 60 ? "bg-[#3d2a2a] text-[#e1a5a5]" : "bg-[#252a3d] text-[#a5c5e1]"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#2a2d3e] h-1">
          <div className="bg-[#6247aa] h-1" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}></div>
        </div>

        {/* Question content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">{question.questionText}</h3>

            {question.type === "FILL_IN_THE_BLANK" ? (
              <div className="mt-4">
                <input
                  type="text"
                  className="w-full p-3 border border-[#2a2d3e] rounded-lg bg-[#252836] text-white focus:ring-2 focus:ring-[#6247aa] focus:border-[#6247aa]"
                  placeholder="Type your answer here..."
                  value={selectedOptions[0] || ""}
                  onChange={(e) => setSelectedOptions([e.target.value])}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {question.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                      selectedOptions.includes(opt._id)
                        ? "bg-[#6247aa]/20 border-[#6247aa]/50"
                        : "hover:bg-[#252836] border-[#2a2d3e]"
                    }`}
                    onClick={() => {
                      if (question.type === "MULTIPLE_CORRECT") {
                        // For multiple choice, toggle the selected option
                        setSelectedOptions((prev) =>
                          prev.includes(opt._id) ? prev.filter((id) => id !== opt._id) : [...prev, opt._id],
                        )
                      } else {
                        // For single choice, replace the selection
                        setSelectedOptions([opt._id])
                      }
                    }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer w-full">
                      {question.type === "MULTIPLE_CORRECT" ? (
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedOptions.includes(opt._id)}
                          onChange={() => {}} // Handled by the div onClick
                        />
                      ) : (
                        <input
                          type="radio"
                          className="mt-1"
                          name="answer"
                          checked={selectedOptions.includes(opt._id)}
                          onChange={() => {}} // Handled by the div onClick
                        />
                      )}
                      <span>{opt.text}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              className={`px-4 py-2 rounded ${
                currentIndex > 0
                  ? "bg-[#252836] hover:bg-[#2a2d3e] text-white"
                  : "bg-[#1e2130] text-gray-500 cursor-not-allowed"
              }`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {/* Only show Next button if not the last question */}
              {!isLastQuestion && (
                <button
                  className="px-6 py-2 bg-[#6247aa] text-white rounded hover:bg-[#7355c7] disabled:bg-[#6247aa]/50"
                  onClick={handleNext}
                  disabled={(question.type !== "MULTIPLE_CORRECT" && selectedOptions.length === 0) || loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Processing...
                    </span>
                  ) : (
                    "Next"
                  )}
                </button>
              )}

              {/* Only show Submit Quiz button if it's the last question */}
              {isLastQuestion && (
                <button
                  className="px-6 py-2 bg-[#6247aa] text-white rounded hover:bg-[#7355c7] disabled:bg-[#6247aa]/50"
                  onClick={handleSubmitQuiz}
                  disabled={(question.type !== "MULTIPLE_CORRECT" && selectedOptions.length === 0) || loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Processing...
                    </span>
                  ) : (
                    "Submit Quiz"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
