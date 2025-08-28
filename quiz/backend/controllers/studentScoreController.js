import StudentScore from "../models/StudentScore.js";

// ✅ POST: Add or Update Student Score & Upcoming Exams
export const addStudentScore = async (req, res) => {
  try {
    const { studentId, courseId, marks = [], upcomingExams = [], gradeThresholds = {} } = req.body;

    // 🛠 Find existing student record
    let studentScore = await StudentScore.findOne({ studentId, courseId });

    if (studentScore) {
      // ✅ Update existing record
      studentScore.marks = marks;
      studentScore.upcomingExams = upcomingExams;
      studentScore.gradeThresholds = gradeThresholds;
    } else {
      // ✅ Create new record
      studentScore = new StudentScore({ studentId, courseId, marks, upcomingExams, gradeThresholds });
    }

    await studentScore.save();
    res.status(201).json({ message: "Student scores updated successfully", studentScore });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ GET: Retrieve Student Progress & Required Marks for Grades
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // 🛠 Find student record
    const studentScore = await StudentScore.findOne({ studentId, courseId });

    if (!studentScore) {
      return res.status(404).json({ message: "No record found for this student and course." });
    }

    // ✅ Calculate total obtained and max possible marks
    let totalScore = studentScore.marks.reduce((sum, exam) => sum + (exam.score || 0), 0);
    let totalMaxScore = studentScore.marks.reduce((sum, exam) => sum + (exam.maxScore || 0), 0);

    // ✅ Calculate remaining exams and required marks for each grade
    const remainingMaxScore = studentScore.upcomingExams?.reduce((sum, exam) => sum + (exam.maxScore || 0), 0) || 0;
    let requiredMarks = {};

    Object.entries(studentScore.gradeThresholds).forEach(([grade, threshold]) => {
      const neededScore = threshold - totalScore;

      if (neededScore <= 0) {
        requiredMarks[grade] = grade === "F" ? "Already passed" : "Already achieved";
      } else if (neededScore > remainingMaxScore) {
        requiredMarks[grade] = "Not possible";
      } else {
        requiredMarks[grade] = `Need ${neededScore} more marks in upcoming exams`;
      }
    });

    // ✅ Send response
    res.status(200).json({
      studentId,
      courseId,
      totalScore,
      totalMaxScore,
      remainingMaxScore,
      requiredMarks,
      upcomingExams: studentScore.upcomingExams,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
