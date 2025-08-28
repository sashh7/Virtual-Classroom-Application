import express from "express";
import { createQuiz, getAllQuizzes, getQuizById, updateQuiz, deleteQuiz } from "../controllers/quizController.js";

const router = express.Router();

router.post("/", createQuiz);  // Create a new quiz
router.get("/", getAllQuizzes); // Get all quizzes
router.get("/:id", getQuizById); // Get a single quiz by ID
router.put("/:id", updateQuiz);  // Update a quiz
router.delete("/:id", deleteQuiz);  // Delete a quiz

export default router;
