const mongoose = require("mongoose");

// Define the chat schema
const chatSchema = new mongoose.Schema({
  sender: {
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], required: true },
  },
  receiver: {
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], required: true },
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Function to create or fetch a dynamic chat collection
const getChatModel = (senderName, receiverName) => {
  // Create a unique collection name (sorted alphabetically)
  const [user1, user2] = [senderName, receiverName].sort();
  const collectionName = `chat_${user1}_${user2}`;

  return mongoose.models[collectionName] || mongoose.model(collectionName, chatSchema, collectionName);
};

module.exports = getChatModel;
