const express = require("express");
const router = express.Router();
const {
  getAssignments,
  submitAssignment,
  upload,
} = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");

// GET all assignments for a student (protected route)
router.get("/assignments", authMiddleware, getAssignments);

// POST assignment submission (protected route, with file upload)
router.post(
  "/assignment/submit/:id",
  authMiddleware,
  upload.single("file"),
  submitAssignment
);


module.exports = router;
