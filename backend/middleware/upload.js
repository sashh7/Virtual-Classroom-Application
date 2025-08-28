const multer = require("multer");
const path = require("path");

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files in 'uploads/resources'
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Get file extension
        const filename = path.basename(file.originalname, ext); // Get filename without extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9); // Ensure uniqueness
        cb(null, `${filename}-${uniqueSuffix}${ext}`); // Keep original filename + unique suffix
    }
});

// Initialize Multer
const upload = multer({ storage: storage });

module.exports = upload;