const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access Denied - No Token Provided" });
        }

        const token = authHeader.replace("Bearer ", ""); 

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(404).json({ error: "User not found" });
        }

        next();  // Proceed to the next middleware
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(400).json({ error: "Invalid Token" });
    }
};

module.exports = authMiddleware;
