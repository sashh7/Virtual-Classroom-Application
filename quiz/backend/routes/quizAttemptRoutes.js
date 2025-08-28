import express from "express";
import { 
  startQuizAttempt, 
  getNextQuestion, 
  submitAnswer, 
  submitQuiz, 
  getQuizResult 
} from "../controllers/quizAttemptController.js";

const router = express.Router();

router.post("/start", startQuizAttempt); // Start a quiz
router.get("/:attemptId/question/:currentIndex", getNextQuestion); // Get question
router.post("/submit-answer", submitAnswer); // Submit answer
router.post("/submit", submitQuiz); // Submit quiz
router.get("/result/:attemptId", getQuizResult); // Get result

export default router;
