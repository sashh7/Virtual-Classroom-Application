const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instruction: { type: String },
  subject: { type: String, required: true }, // New field for subject
  duetime: { type: String, required: true }, // Example: "23:59"
  duedate: { type: Date, required: true },
  relatedfile: { type: String }, // Stores the file path of the related file
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedFiles: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      studentName: { type: String}, // ✅ Added student name
      rollNumber: { type: String }, // ✅ Added roll number
      fileUrl: { type: String}, // Stores the uploaded file URL
      submittedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
