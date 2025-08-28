import express from "express";
import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";

const router = express.Router();

// 🟢 1. Add a Question to a Quiz
router.post("/", async (req, res) => {
  try {
    const { quizId, type, questionText, options, correctAnswer, negativeMarks } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const newQuestion = new Question({ quizId, type, questionText, options, correctAnswer, negativeMarks });
    await newQuestion.save();

    // Update quiz with new question ID
    quiz.questions.push(newQuestion._id);
    await quiz.save();

    res.status(201).json({ message: "Question added successfully!", question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 2. Get All Questions for a Quiz
router.get("/:quizId", async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 3. Update a Question
router.put("/:questionId", async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
    res.json({ message: "Question updated successfully!", question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 4. Delete a Question
router.delete("/:questionId", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.json({ message: "Question deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
