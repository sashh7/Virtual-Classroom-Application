import mongoose from "mongoose";

const StudentScoreSchema = new mongoose.Schema({
  studentId: {  type: String, required: true }, // Reference to Student
  courseId: { type: String, required: true }, // Reference to Course
  marks: [
    {
      examType: { type: String, required: true }, // Example: "Midterm", "Final", "Quiz"
      score: { type: Number, required: true },
      maxScore: { type: Number, required: true },
    },
  ],
  upcomingExams: [
    {
      examType: { type: String, required: true },
      maxScore: { type: Number, required: true },
    },
  ],
  gradeThresholds: {
    O: { type: Number, required: true }, // Example: 90+
    "A+": { type: Number, required: true },
    A: { type: Number, required: true },
    "B+": { type: Number, required: true },
    B: { type: Number, required: true },
    C: { type: Number, required: true },
    F: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudentScore", StudentScoreSchema);
