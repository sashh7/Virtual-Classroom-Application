"use client";
import { useState } from "react";

export default function QuestionForm({ onAdd }) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedCorrectIndices, setSelectedCorrectIndices] = useState([]);
  const [fillAnswer, setFillAnswer] = useState("");

  const handleSubmit = () => {
    if (!questionText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }

    let questionPayload = {
      questionText,
      type: questionType,
      negativeMarks: 0, // default if you want
    };

    if (questionType === "FILL_IN_THE_BLANK") {
      if (!fillAnswer.trim()) {
        alert("Enter the correct answer for fill in the blank.");
        return;
      }
      // We'll store the single correct answer in correctAnswer
      questionPayload.correctAnswer = fillAnswer;
    } else {
      // For MCQ or MULTIPLE_CORRECT
      if (options.some((opt) => !opt.trim())) {
        alert("All options must be filled.");
        return;
      }
      if (selectedCorrectIndices.length === 0) {
        alert("Select at least one correct answer.");
        return;
      }
      // Convert each option into { text, isCorrect }
      const finalOptions = options.map((opt, idx) => ({
        text: opt,
        isCorrect: selectedCorrectIndices.includes(idx),
      }));
      questionPayload.options = finalOptions;
    }

    // Clear form
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setSelectedCorrectIndices([]);
    setFillAnswer("");

    // Pass the question data to the parent
    onAdd(questionPayload);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectSelection = (index) => {
    if (questionType === "MCQ") {
      // Only one correct
      setSelectedCorrectIndices([index]);
    } else if (questionType === "MULTIPLE_CORRECT") {
      // Toggle
      if (selectedCorrectIndices.includes(index)) {
        setSelectedCorrectIndices(selectedCorrectIndices.filter((i) => i !== index));
      } else {
        setSelectedCorrectIndices([...selectedCorrectIndices, index]);
      }
    }
  };

  return (
    <div className="border p-4 mb-4">
      <h3 className="text-xl font-semibold mb-2">Add a Question</h3>

      <textarea
        className="w-full border p-2 mb-2"
        placeholder="Question text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <select
        className="w-full border p-2 mb-2"
        value={questionType}
        onChange={(e) => {
          setQuestionType(e.target.value);
          // Reset fields on type change
          setOptions(["", "", "", ""]);
          setSelectedCorrectIndices([]);
          setFillAnswer("");
        }}
      >
        <option value="MCQ">MCQ (Single Correct)</option>
        <option value="MULTIPLE_CORRECT">Multiple Correct</option>
        <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
      </select>

      {questionType === "FILL_IN_THE_BLANK" ? (
        <input
          className="w-full border p-2 mb-2"
          type="text"
          placeholder="Correct answer"
          value={fillAnswer}
          onChange={(e) => setFillAnswer(e.target.value)}
        />
      ) : (
        <div>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                className="border p-2 w-full mr-2"
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
              />
              <input
                type={questionType === "MCQ" ? "radio" : "checkbox"}
                checked={selectedCorrectIndices.includes(idx)}
                onChange={() => handleCorrectSelection(idx)}
              />
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
        Add Question
      </button>
    </div>
  );
}
