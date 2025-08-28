const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String, // URL to the uploaded file
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the teacher who uploaded the resource
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Resource", ResourceSchema);