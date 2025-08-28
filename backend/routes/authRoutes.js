const express = require("express");
const { register, login, verifyEmail } = require("../controllers/authController");
const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/verify-email/:token", verifyEmail);

module.exports = router;
