const express = require("express");
const router = express.Router();
const { uploadResource, getResourcesBySubject ,getAllSubjects} = require("../controllers/resourceController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // Import the Multer upload module

// Teacher uploads resource
router.post("/upload",authMiddleware, upload.single("file"), uploadResource);

// Get all subjects that have uploaded resources
router.get("/subjects", authMiddleware, getAllSubjects);

// Students fetch resources by subject
router.get("/:subject", authMiddleware, getResourcesBySubject);

module.exports = router;
