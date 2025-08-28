"use client";
import { useEffect, useState } from "react";
import { fetchQuizzes } from "../utils/api";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    async function loadQuizzes() {
      const data = await fetchQuizzes();
      setQuizzes(data);
    }
    loadQuizzes();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Available Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id} className="border p-4 mb-2 rounded">
            <h3 className="text-lg font-semibold">{quiz.title}</h3>
          </div>
        ))
      )}
    </div>
  );
}
