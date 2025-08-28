import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// 📌 Start a Quiz Attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Check if user already attempted
    const existingAttempt = await QuizAttempt.findOne({ userId, quizId, isCompleted: false });
    if (existingAttempt) return res.status(200).json(existingAttempt);

    // Create new attempt
    const attempt = new QuizAttempt({ userId, quizId, answers: [] });
    await attempt.save();

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get Next Question
export const getNextQuestion = async (req, res) => {
  try {
    const { attemptId, currentIndex } = req.params;
    const attempt = await QuizAttempt.findById(attemptId).populate("quizId");

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    const quiz = await Quiz.findById(attempt.quizId).populate("questions");

    if (currentIndex < 0 || currentIndex >= quiz.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    res.json(quiz.questions[currentIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Submit Answer
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedOptions } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Check if answer already exists
    const existingAnswer = attempt.answers.find(ans => ans.questionId.equals(questionId));
    if (existingAnswer) {
      existingAnswer.selectedOptions = selectedOptions;
      existingAnswer.submittedAt = new Date();
    } else {
      attempt.answers.push({ questionId, selectedOptions });
    }

    await attempt.save();
    res.status(200).json({ message: "Answer submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await QuizAttempt.findById(attemptId).populate("answers.questionId");
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    let score = 0;

    // Helper: Compare two arrays for equality (assumes both arrays are sorted)
    const arraysEqual = (a, b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    };

    // Helper: Convert a user's answer to the corresponding option text.
    // If the answer is a letter (A-Z/a-z), map it to the option at that index.
    // Otherwise, check if the answer matches an option's _id.
    const convertAnswerToText = (question, answerOption) => {
      // Check if answerOption is a single letter
      if (typeof answerOption === "string" && /^[A-Za-z]$/.test(answerOption)) {
        const index = answerOption.toUpperCase().charCodeAt(0) - 65; // 'A' => 0, 'B' => 1, etc.
        if (index >= 0 && index < question.options.length) {
          return question.options[index].text;
        }
      }
      // Otherwise, try to find an option whose _id matches answerOption (as string)
      const foundOption = question.options.find(opt => opt._id.toString() === answerOption);
      if (foundOption) return foundOption.text;
      // Fallback: return the answer as is
      return answerOption;
    };

    // Process each answer
    attempt.answers.forEach(answer => {
      const question = answer.questionId;
      if (!question) return;

      if (question.type === "MCQ" || question.type === "MULTIPLE_CORRECT") {
        // Retrieve the correct option texts and sort them
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text)
          .sort();
        // Convert user's selected options to texts (whether letter or option id) and sort
        const userOptions = (answer.selectedOptions || [])
          .map(sel => convertAnswerToText(question, sel))
          .sort();

        if (arraysEqual(correctOptions, userOptions)) {
          score += 1;
        }
      } else if (question.type === "FILL_IN_THE_BLANK") {
        // For fill in the blank, do a case-insensitive comparison
        if (
          answer.selectedOptions &&
          answer.selectedOptions.length > 0 &&
          question.correctAnswer.toLowerCase() === answer.selectedOptions[0].toLowerCase()
        ) {
          score += 1;
        }
      }
    });

    attempt.score = score;
    attempt.isCompleted = true;
    attempt.endTime = new Date();
    await attempt.save();

    res.status(200).json({ message: "Quiz submitted successfully", score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get Quiz Results
export const getQuizResult = async (req, res) => {
  try {
    
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findById(attemptId).populate("quizId");
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    const quiz = await Quiz.findById(attempt.quizId);  
    if (quiz.resultsVisible === "IMMEDIATE") {
      res.json({ score: attempt.score });
    } else {
      res.json({ message: "Results will be available later" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
