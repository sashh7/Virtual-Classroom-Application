import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  type: { 
    type: String, 
    enum: ["MCQ", "MULTIPLE_CORRECT", "FILL_IN_THE_BLANK"], 
    required: true 
  },
  questionText: { type: String, required: true },
  options: [{ text: String, isCorrect: Boolean }], // For MCQ and MULTIPLE_CORRECT
  correctAnswer: { type: String }, // For FILL_IN_THE_BLANK
  negativeMarks: { type: Number, default: 0 } // Optional Negative Marking
});

export default mongoose.model("Question", questionSchema);
