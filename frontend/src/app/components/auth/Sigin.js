"use client";
import { useState } from "react";

function Signin({ goToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollno: "",
    class: "",
    phone: "",
    address: "",
    role: "student",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage("");
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    // This regex ensures the email has a valid format (like test@example.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setMessage("❌ Please enter a valid email address (e.g., example@gmail.com).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setMessage("❌ Please enter a valid 10-digit phone number.");
      return;
    }

    setMessage("Registering...");

    try {
      const res = await fetch("http://localhost:5001/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registration successful! Please check your email for verification.");
      } else {
        setMessage(data.message || "❌ Registration failed.");
      }
    } catch (error) {
      setMessage("❌ Server error. Try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#191b2a]">
      <div className="bg-[#23273d] p-8 shadow-lg rounded-xl w-96">
        <h2 className="text-3xl font-bold mb-4 text-center text-white">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="text"
            name="rollno"
            placeholder="Roll Number"
            value={formData.rollno}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="text"
            name="class"
            placeholder="Class"
            value={formData.class}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#23273d] text-white border border-gray-500 rounded-lg"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="parent">Parent</option>
          </select>
          <button
            type="submit"
            className="w-full bg-[#5843d3] text-white p-3 rounded-lg hover:bg-opacity-90"
          >
            Register
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-300">{message}</p>}
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <button onClick={goToLogin} className="text-[#5843d3] hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signin;
