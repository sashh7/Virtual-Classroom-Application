import express from "express";
import { addStudentScore, getStudentProgress } from "../controllers/studentScoreController.js"

const router = express.Router();
router.post("/", addStudentScore);
router.get("/:studentId/:courseId", getStudentProgress);

export default router;
