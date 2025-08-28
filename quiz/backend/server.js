import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import quiz routes
import quizRoutes from "./routes/quizRoutes.js";
app.use("/api/quiz", quizRoutes);

import questionRoutes from "./routes/questionRoutes.js";
app.use("/api/questions", questionRoutes);

import quizAttemptRoutes from "./routes/quizAttemptRoutes.js";
app.use("/api/quiz-attempts", quizAttemptRoutes);
import studentScoreRoutes from "./routes/studentScoreRoutes.js";
app.use("/api/v1/student-score", studentScoreRoutes);
// Connect to MongoDB only if not in test mode
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

  const PORT = process.env.PORT || 5005;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;
