const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

let users = {}; // Stores connected users and their socket IDs
let raisedHands = []; // Track which users have raised their hands

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle new user joining the room
  socket.on("join-room", (rollNumber, callback) => {
    if (!rollNumber) {
      return callback({ error: "Roll number is required!" });
    }
    if (users[rollNumber]) {
      return callback({ error: "Roll number already exists!" });
    }

    // Add user to the users object
    users[rollNumber] = socket.id;
    socket.rollNumber = rollNumber;

    // Notify all participants about the updated list
    io.emit("update-participants", Object.keys(users));

    // Notify other participants about the new user
    socket.broadcast.emit("new-user", rollNumber);

    // Send current raised hands to the new user
    socket.emit("update-raised-hands", raisedHands);

    callback({ success: true });
  });

  // Handle WebRTC offer
  socket.on("offer", ({ to, offer }) => {
    if (users[to]) {
      io.to(users[to]).emit("offer", { from: socket.rollNumber, offer });
    } else {
      console.log("User ${to} not found");
    }
  });

  // Handle WebRTC answer
  socket.on("answer", ({ to, answer }) => {
    if (users[to]) {
      io.to(users[to]).emit("answer", { from: socket.rollNumber, answer });
    } else {
      console.log("User ${to} not found");
    }
  });

  // Handle ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    if (users[to]) {
      io.to(users[to]).emit("ice-candidate", { from: socket.rollNumber, candidate });
    } else {
      console.log("User ${to} not found");
    }
  });

  // Handle chat messages
  socket.on("chat-message", (msg) => {
    io.emit("chat-message", msg);
  });

  // Handle whiteboard drawing events
  socket.on("draw", (data) => {
    // Broadcast drawing data to all other participants
    socket.broadcast.emit("draw", data);
  });

  // Handle hand raise
  socket.on("raise-hand", (rollNumber) => {
    if (!raisedHands.includes(rollNumber)) {
      raisedHands.push(rollNumber);
      io.emit("hand-raised", rollNumber);
    }
  });

  // Handle hand lower
  socket.on("lower-hand", (rollNumber) => {
    raisedHands = raisedHands.filter(id => id !== rollNumber);
    io.emit("hand-lowered", rollNumber);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.rollNumber) {
      // Remove from users list
      delete users[socket.rollNumber];
      
      // Remove from raised hands if they had raised hand
      if (raisedHands.includes(socket.rollNumber)) {
        raisedHands = raisedHands.filter(id => id !== socket.rollNumber);
        io.emit("hand-lowered", socket.rollNumber);
      }
      
      // Notify remaining participants
      io.emit("update-participants", Object.keys(users));
    }
  });
});

server.listen(5002, () => {
  console.log("Server running on port 5002");
});