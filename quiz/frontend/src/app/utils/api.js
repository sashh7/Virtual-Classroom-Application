"use client";
import axios from "axios";

const BASE_URL = "http://localhost:5005/api"; // Adjust if needed

// Fetch all quizzes
export async function fetchQuizzes() {
  try {
    const response = await axios.get(`${BASE_URL}/quiz`);
    return response.data; // Array of quizzes
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
}

// Fetch a single quiz by ID
export async function fetchQuizById(quizId) {
  try {
    const response = await axios.get(`${BASE_URL}/quiz/${quizId}`);
    return response.data; // Single quiz object
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return null;
  }
}

// Create a new quiz (returns { message, quiz })
export async function createQuiz(quizData) {
  try {
    const response = await axios.post(`${BASE_URL}/quiz`, quizData);
    return response.data; // { message, quiz }
  } catch (error) {
    console.error("Error creating quiz:", error?.response?.data || error);
    return null;
  }
}

// Create a question for a quiz (returns { message, question })
export async function createQuestion(questionData) {
    const BASE_URL = "http://localhost:5005/api"; // or your backend URL
    try {
      const response = await fetch(`${BASE_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });
      if (!response.ok) throw new Error("Failed to create question");
      return await response.json(); // { message, question }
    } catch (error) {
      console.error("Error creating question:", error);
      return null;
    }
  }
  export async function updateQuiz(quizId, updateData) {
    try {
      const response = await fetch(`http://localhost:5005/api/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update quiz");
      return await response.json(); // { message, quiz }
    } catch (error) {
      console.error("Error updating quiz:", error);
      return null;
    }
  }
  export async function deleteQuiz(quizId) {
    try {
      const res = await fetch(`http://localhost:5005/api/quiz/${quizId}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      return null;
    }
  }

// 1️⃣ Start a quiz attempt
export async function startQuizAttempt(userId, quizId) {
  try {
    const response = await fetch("http://localhost:5005/api/quiz-attempts/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, quizId }),
    });
    if (!response.ok) throw new Error("Failed to start quiz attempt");
    return await response.json(); // returns the QuizAttempt object
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return null;
  }
}

// 2️⃣ Get question by index
export async function getQuestion(attemptId, currentIndex) {
  try {
    const response = await fetch(`http://localhost:5005/api/quiz-attempts/${attemptId}/question/${currentIndex}`);
    if (!response.ok) throw new Error("Failed to fetch question");
    return await response.json(); // returns a Question object
  } catch (error) {
    console.error("Error getting question:", error);
    return null;
  }
}

// 3️⃣ Submit answer for a question
export async function submitAnswer({ attemptId, questionId, selectedOptions }) {
  try {
    const response = await fetch("http://localhost:5005/api/quiz-attempts/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, questionId, selectedOptions }),
    });
    if (!response.ok) throw new Error("Failed to submit answer");
    return await response.json(); // { message: "Answer submitted successfully" }
  } catch (error) {
    console.error("Error submitting answer:", error);
    return null;
  }
}

// 4️⃣ Submit entire quiz & calculate score
export async function submitQuizAttempt(attemptId) {
  try {
    const response = await fetch("http://localhost:5005/api/quiz-attempts/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });
    if (!response.ok) throw new Error("Failed to submit quiz");
    return await response.json(); // { message, score }
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return null;
  }
}

// 5️⃣ Get quiz result
export async function getQuizResult(attemptId) {
  try {
    const response = await fetch(`http://localhost:5005/api/quiz-attempts/result/${attemptId}`);
    if (!response.ok) throw new Error("Failed to fetch quiz result");
    return await response.json(); // { score } or { message: "Results will be available later" }
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    return null;
  }
}
