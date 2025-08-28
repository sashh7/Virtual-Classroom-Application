import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// 📌 Create a new quiz (Prevent duplicate titles)
export const createQuiz = async (req, res) => {
  try {
    const { title, teacherId, questions, totalTime, resultsVisible } = req.body;

    // Check if a quiz with the same title already exists
    const existingQuiz = await Quiz.findOne({ title });
    if (existingQuiz) {
      return res.status(400).json({ error: "A quiz with this title already exists." });
    }

    // Create quiz document
    const newQuiz = new Quiz({
      title,
      teacherId,
      questions: [], // Initialize as empty; questions will be added separately
      totalTime,
      resultsVisible
    });

    await newQuiz.save();

    // If questions are provided, add them to the quiz
    if (questions && questions.length > 0) {
      const createdQuestions = await Question.insertMany(
        questions.map(q => ({ ...q, quizId: newQuiz._id }))
      );

      newQuiz.questions = createdQuestions.map(q => q._id);
      await newQuiz.save();
    }

    res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get all quizzes (Ensure questions are populated)
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get a single quiz by ID (Ensure questions are populated)
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedQuiz) return res.status(404).json({ error: "Quiz not found" });

    res.status(200).json({ message: "Quiz updated successfully!", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete a quiz (Also delete associated questions)
export const deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    await Question.deleteMany({ quizId: deletedQuiz._id });
    return res.status(200).json({ message: "Quiz deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: error.message });
  }
};

