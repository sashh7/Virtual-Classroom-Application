const Assignment = require("../models/Assignment");
const multer = require("multer");
const path = require("path");

// ─── GET All Assignments for a Student ────────────────────────────────────────
exports.getAssignments = async (req, res) => {
  try {
    console.log(
      "Fetching assignments for student:",
      req.user ? req.user.id : "Unknown User"
    );
    const assignments = await Assignment.find({}).populate("teacher", "name");
    console.log("Fetched assignments:\n", JSON.stringify(assignments, null, 2));
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── Multer Storage Configuration with Detailed Logging ─────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("🔥 [MULTER] Destination function called.");
    console.log("📂 Storing file in uploads folder...");
    cb(null, "uploads/"); // Save files in 'uploads' directory
  },
  filename: function (req, file, cb) {
    console.log("🔥 [MULTER] Filename function called.");
    console.log("📄 Original filename:", file.originalname);
    const fileExtension = path.extname(file.originalname);
    console.log("📄 File extension extracted:", fileExtension);
    const baseName = path
      .basename(file.originalname, fileExtension)
      .replace(/\s+/g, "_");
    console.log("📝 Processed base name:", baseName);
    const generatedFileName = Date.now() + "-" + baseName + fileExtension;
    console.log("✅ [MULTER] Generated filename:", generatedFileName);
    cb(null, generatedFileName); // Save with correct extension
  },
});

exports.upload = multer({ storage: storage });

// ─── Submit Assignment ─────────────────────────────────────────────────────────
exports.submitAssignment = async (req, res) => {
  try {
    console.log("📥 Received file:", req.file);
    console.log("📥 Received body:", req.body);

    const assignmentId = req.params.id;
    if (!assignmentId) {
      return res.status(400).json({ error: "Missing assignmentId" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    // Construct the file URL (using backend's public URL)
    const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    console.log("🔗 File URL generated:", fileUrl);

    // Extract and validate student details from the request body
    const studentId = req.user?.id || "Unknown";
    const studentName = req.body?.name ? req.body.name.trim() : null;
    const rollNumber = req.body?.rollno ? req.body.rollno.trim() : null;

    if (!studentName || !rollNumber) {
      return res
        .status(400)
        .json({ error: "Student name and roll number are required" });
    }

    console.log(
      `👤 Adding submission for student: ${studentId}, Name: ${studentName}, Roll No: ${rollNumber}`
    );

    // Ensure submittedFiles is an array
    if (!Array.isArray(assignment.submittedFiles)) {
      assignment.submittedFiles = [];
    }

    const submission = {
      student: studentId,
      studentName: String(studentName).trim(),
      rollNumber: String(rollNumber).trim(),
      fileUrl: fileUrl,
      submittedAt: new Date(),
    };

    console.log(
      "📝 Final submission object:",
      JSON.stringify(submission, null, 2)
    );

    assignment.submittedFiles.push(submission);
    assignment.markModified("submittedFiles");

    await assignment.save();

    console.log("✅ Submission saved successfully!");
    res.json({ message: "Assignment submitted successfully!", fileUrl });
  } catch (error) {
    console.error("❌ Submit error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
