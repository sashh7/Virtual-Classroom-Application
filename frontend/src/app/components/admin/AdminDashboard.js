"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ManageCourses from "./ManageCourses";
import AdminProfile from "./AdminProfile.js";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherData, setTeacherData] = useState({
    rollno: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    class: "", // Added class field
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const correctUsername = "admin";
  const correctPassword = "password123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === correctUsername && password === correctPassword) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("❌ Incorrect username or password");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchAdminProfile() {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const name = user.name;

        const response = await fetch(
          "http://localhost:5001/api/v1/admin/profile",
          {
            method: "GET",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setAdmin({ ...data, name });
        } else {
          console.error("Error fetching admin profile:", data.error);
        }
      } catch (error) {
        console.error("Fetch admin profile error:", error);
      }
    }
    fetchAdminProfile();
  }, [isAuthenticated]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setTeacherData({
      rollno: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      class: "", // Reset class field
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacherData({ ...teacherData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5001/api/v1/admin/teachers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(teacherData),
        }
      );

      if (response.ok) {
        console.log("Teacher added successfully!");
        closeModal();
      } else {
        console.error("Failed to add teacher");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <h2 className="text-2xl font-bold mb-4">🔒 Admin Login</h2>
          {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
          <form onSubmit={handleLogin}>
            <label className="block mb-2">
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded mt-1 text-black"
                required
              />
            </label>
            <label className="block mb-4">
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded mt-1 text-black"
                required
              />
            </label>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1b1c30] text-white flex flex-col">
      <Header
        admin={admin}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div
        className={`flex flex-1 pt-24 transition-all duration-300 ${
          sidebarOpen ? "pl-64" : "pl-0"
        }`}
      >
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 p-6">
          <h2 className="text-xl font-bold mb-4">📌 Admin Dashboard</h2>
          <ManageCourses />
          {admin && <AdminProfile admin={admin} />}
          <h2 className="text-xl font-bold mt-8 mb-4">👨‍🏫 Add Teachers</h2>
          <button
            onClick={openModal}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            ➕ Add Teacher
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 text-black">
            <h2 className="text-xl font-bold mb-4">➕ Add New Teacher</h2>
            <form onSubmit={handleSubmit}>
              {Object.keys(teacherData).map((field) => (
                <label key={field} className="block mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                  <input
                    type="text"
                    name={field}
                    value={teacherData[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded mt-1"
                    required
                  />
                </label>
              ))}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
