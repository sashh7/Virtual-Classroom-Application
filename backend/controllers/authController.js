const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // Or use Mailtrap for testing
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @desc Register User
// @route POST /api/v1/auth/register
exports.register = async (req, res) => {

      try {
        const { name, rollno, email, password, confirmPassword, phone, address, role, class: userClass } = req.body;

        // Validate role
        if (!['student', 'teacher', 'product owner', 'parent'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Validate passwords
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if email, phone, or rollno already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }, { rollno }],
        });

        if (existingUser) {
            let message = 'User with ';
            if (existingUser.email === email) message += 'this email ';
            if (existingUser.phone === phone) message += 'this phone number ';
            if (existingUser.rollno === rollno) message += 'this roll number ';
            message += 'already exists.';
            return res.status(400).json({ message });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            name,
            rollno,
            email,
            password: hashedPassword,
            phone,
            address,
            role,
            class: userClass,
        });


        // Generate verification token
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${token}`;

        // Send email verification
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            html: `<h3>Click the link to verify your email:</h3> <a href="${verificationUrl}">${verificationUrl}</a>`,
        });

        res.status(201).json({
            message: "User registered. Please verify your email.",
            user: {
                id: newUser._id,
                name: newUser.name,
                rollno: newUser.rollno,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                role: newUser.role,
                class: newUser.class,
                isVerified: newUser.isVerified,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Login User
// @route POST /api/v1/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "❌ Invalid credentials" });

        // Check if user is verified
        if (!user.isVerified) return res.status(400).json({ error: "⚠️ Please verify your email first" });

        // Validate user role
        if (user.role !== role) return res.status(400).json({ error: `⚠️ Incorrect role selection: Expected ${user.role}` });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "❌ Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        let redirectUrl = "";
        if (user.role === "student") redirectUrl = "/student-dashboard.html";
        else if (user.role === "teacher") redirectUrl = "/teacher-dashboard.html";

        res.json({
            message: " Login successful!",
            token,
            user: {
                name: user.name,
                rollno: user.rollno,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                class: user.class,
            },
            redirectUrl,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: " Server error. Please try again later." });
    }
};

// @route GET /api/v1/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        res.json({ message: " Email verified successfully", user: { email: user.email, isVerified: user.isVerified } });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

// ragul modification
exports.getFacultyMembers = async (req, res) => {
    try {
        const faculties = await User.find({ role: "teacher" }).select("name email");
        res.json({ faculties });
    } catch (error) {
        res.status(500).json({ error: "Server error. Unable to fetch faculty members." });
    }
};
