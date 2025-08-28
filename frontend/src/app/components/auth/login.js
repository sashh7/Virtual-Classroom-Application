import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaEnvelope,
  FaLock,
  FaKey,
} from "react-icons/fa";

function Login({ goToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Immediately redirect to /admin if "admin" is selected
    if (name === "role" && value === "admin") {
      router.push("/admin");
      return;
    }
    else if (value === "parent") {
      router.push("/parent/login");
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await fetch("http://localhost:5001/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Login API Response:", data);

      if (res.ok) {
        if (data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.role);
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("User stored in localStorage:", data.user);
        } else {
          console.error("No user object found in response");
        }

        setMessage("Login successful! Redirecting...");

        if (data.user?.role === "teacher") {
          router.push("/teacher");
        } else if (data.user?.role === "student") {
          router.push("/student");
        } else if (data.user?.role === "parent") {
          router.push("/parent");
        } else {
          router.push("/");
        }
      } else {
        setMessage(data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Server error:", error);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#191b2a]">
      <div className="bg-[#23273d] p-8 shadow-lg rounded-xl w-96">
        <h2 className="text-3xl font-bold mb-4 text-center text-white flex items-center justify-center">
          <FaKey className="mr-2" /> Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-500 rounded-lg bg-[#23273d] text-white"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="parent">Parent</option> 
          </select>

          <div className="relative flex items-center">
            <FaEnvelope className="absolute left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 pl-10 border border-gray-500 rounded-lg bg-[#23273d] text-white"
            />
          </div>

          <div className="relative flex items-center">
            <FaLock className="absolute left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 pl-10 border border-gray-500 rounded-lg bg-[#23273d] text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#5843d3] text-white p-3 rounded-lg hover:bg-opacity-90"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-300">{message}</p>}
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={goToRegister}
            className="text-[#5843d3] hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;