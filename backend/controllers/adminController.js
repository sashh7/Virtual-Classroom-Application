const Course = require("../models/Course");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// ✅ Add a new course
exports.addCourse = async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;
    console.log(req.body)
    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ error: "Invalid teacher ID" });
    }

    const newCourse = new Course({ title, description, teacher: teacherId });
    await newCourse.save();
    console.log("✅ Course added successfully:", newCourse);
    res
      .status(201)
      .json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error("❌ Error in addCourse:", error);console.error("❌ Error in addCourse:", error);
    res.status(500).json({ error: "Failed to add course" });
  }
};

// ✅ Delete a course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// ✅ Add a new teacher
exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, address, rollno } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !phone || !address || !rollno) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Received request to add teacher:", req.body);

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher
    const newTeacher = new User({
      rollno,
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "teacher",
      isVerified: true, // Assuming all teachers are verified upon creation
    });

    await newTeacher.save();
    console.log("✅ Teacher added successfully:", newTeacher);

    res.status(201).json({
      message: "Teacher added successfully",
      teacher: { name, email, phone, address, role: "teacher" }, // Avoid sending password
    });
  } catch (error) {
    console.error("❌ Error adding teacher:", error);
    res.status(500).json({ error: error.message || "Failed to add teacher" });
  }
};


// ✅ Delete a teacher by ID
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};
