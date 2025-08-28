const Resource = require("../models/Resource");
const multer = require("multer");
const path = require("path");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to uploads/ directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Resource.distinct("subject"); // Fetch unique subjects

    if (!subjects.length) {
      return res
        .status(404)
        .json({ message: "No subjects found", subjects: [] });
    }

    console.log("Sending subjects:", subjects);
    res.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

// Upload a resource
exports.uploadResource = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    // Create a new resource entry
    const newResource = new Resource({
      subject,
      fileUrl: `/uploads/${req.file.filename}`, // Store file path
      uploadedBy: req.user.id,
    });

    await newResource.save();
    console.log("Resource uploaded:", newResource);
    res.json({
      message: "Resource uploaded successfully!",
      resource: newResource,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get resources by subject
exports.getResourcesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
      const resources = await Resource.find({ subject });
      console.log(subject)

    if (!resources.length) {
      return res
        .status(404)
        .json({ message: "No resources found for this subject" });
    }

    console.log(`Resources for subject ${subject}:`, resources);
    res.json({ subject, resources });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Middleware for file uploads
exports.uploadMiddleware = upload.single("file");
