import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // Ensure title is unique
  teacherId: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  totalTime: { type: Number, required: true }, // Time in minutes
  status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" }, // Draft or Published
  resultsVisible: { type: String, required: true }, // Show marks immediately or after time
});

export default mongoose.model("Quiz", quizSchema);
