const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  addCourse,
  deleteCourse,
  addTeacher,
  deleteTeacher,
} = require("../controllers/adminController");

// Debug: Check if functions are imported correctly
console.log({
  getAllCourses,
  addCourse,
  deleteCourse,
  addTeacher,
  deleteTeacher,
});

// ✅ Fetch all courses
router.get("/courses", getAllCourses);

// ✅ Add a new course
router.post("/courses", addCourse);

// ✅ Delete a course by ID
router.delete("/courses/:id", deleteCourse);

// ✅ Add a new teacher
router.post("/teachers", addTeacher);

// ✅ Delete a teacher by ID
router.delete("/teachers/:id", deleteTeacher);

module.exports = router;
