import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedOptions: [{ type: String }],
      submittedAt: { type: Date, default: Date.now },
    },
  ],
  isCompleted: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual fields for quiz time and total number of questions
quizAttemptSchema.virtual("quizTime").get(function () {
  return this.quizId ? this.quizId.totalTime : null;
});

quizAttemptSchema.virtual("totalQuestions").get(function () {
  return this.quizId ? this.quizId.questions.length : 0;
});

// Automatically populate quiz details before returning the data
quizAttemptSchema.pre(/^find/, function (next) {
  this.populate({
    path: "quizId",
    select: "totalTime questions",
  });
  next();
});

export default mongoose.model("QuizAttempt", quizAttemptSchema);
