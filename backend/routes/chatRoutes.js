const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { getFacultyMembers } = require("../controllers/authController");
// ✅ Send a message (POST)
router.post("/send", chatController.createChat);

// ✅ Get all messages between two users (GET)
router.get("/:senderName/:receiverName", chatController.getChatsBetweenUsers);

// ✅ Update a message (PUT)
router.put("/:senderName/:receiverName/:chatId", chatController.updateChat);

// ✅ Delete a message (DELETE)
router.delete("/:senderName/:receiverName/:chatId", chatController.deleteChat);

// Get all the faculty
router.get("/faculty", getFacultyMembers);

// Get all the students
router.get("/faculty/:facultyName/students", chatController.getStudentsWhoMessagedFaculty);

module.exports = router;
