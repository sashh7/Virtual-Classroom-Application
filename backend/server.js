require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// ✅ CORS Setup (Fixing Issues)
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allow required HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow required headers
  })
);

// ✅ Middleware
app.use(express.json()); // Parses JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/",
  express.static(path.join(__dirname, "uploads/"))
);

// ✅ Connect Database before Routes
connectDB();

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes.js"); // ✅ Admin APIs Added


// ragul modification starts
const chatRoutes = require('./routes/chatRoutes');
// ragul modification ends


app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api/v1", authRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/admin", adminRoutes); // ✅ Admin Routes

// ragul modification starts
app.use('/api', chatRoutes);
// ragul modification ends

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
