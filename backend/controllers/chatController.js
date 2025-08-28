const getChatModel = require("../models/Chat");
const mongoose = require("mongoose");

// ✅ Create or store a chat message
exports.createChat = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    // Prevent sender from chatting with themselves
    if (sender.name === receiver.name) {
      return res.status(400).json({ success: false, message: "Sender and receiver cannot be the same" });
    }

    // Get or create the correct chat collection
    const Chat = getChatModel(sender.name, receiver.name);

    // Store the message in the chat table
    const newChat = new Chat({ sender, receiver, message });
    await newChat.save();

    res.status(201).json({ success: true, data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all chat messages between two users
exports.getChatsBetweenUsers = async (req, res) => {
  try {
    const { senderName, receiverName } = req.params;

    // Get the correct chat collection
    const Chat = getChatModel(senderName, receiverName);

    // Fetch all messages sorted by timestamp
    const chats = await Chat.find().sort({ timestamp: 1 });

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update a chat message by ID
exports.updateChat = async (req, res) => {
  try {
    const { senderName, receiverName, chatId } = req.params;
    const { message } = req.body;

    // Get the correct chat collection
    const Chat = getChatModel(senderName, receiverName);

    // Update the message
    const updatedChat = await Chat.findByIdAndUpdate(chatId, { message }, { new: true });

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete a chat message by ID
exports.deleteChat = async (req, res) => {
  try {
    const { senderName, receiverName, chatId } = req.params;

    // Get the correct chat collection
    const Chat = getChatModel(senderName, receiverName);

    // Delete message
    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getStudentsWhoMessagedFaculty = async (req, res) => {
  const { facultyName } = req.params;

  try {
    // Get all collection names from MongoDB
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Filter collections that start with "chat_" and include facultyName
    const chatCollections = collections
      .map((col) => col.name)
      .filter((name) => name.startsWith("chat_") && name.includes(facultyName));

    console.log("Filtered Chat Collections:", chatCollections); // Debugging log

    let studentSet = new Set();

    // Loop through each chat collection and fetch messages
    for (let collectionName of chatCollections) {
      const chats = await mongoose.connection.db
        .collection(collectionName)
        .find({ "receiver.name": facultyName })
        .toArray();

      chats.forEach((chat) => {
        if (chat.sender.role === "student") {
          studentSet.add(chat.sender.name);
        }
      });
    }

    return res.status(200).json({ students: Array.from(studentSet) });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
