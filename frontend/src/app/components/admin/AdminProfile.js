"use client";

import { useState } from "react";

export default function AdminProfile({ admin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5001/api/v1/admin/profile",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        console.error("Error updating profile:", data.error);
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">👤 Admin Profile</h2>
      <div className="bg-[#23273D] p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-300">Name:</label>
          {isEditing ? (
            <input
              type="text"
              className="bg-gray-700 p-2 rounded text-white w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <p className="text-white">{admin?.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-300">Email:</label>
          {isEditing ? (
            <input
              type="email"
              className="bg-gray-700 p-2 rounded text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <p className="text-white">{admin?.email}</p>
          )}
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                className="bg-green-500 p-2 rounded text-white font-semibold"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-red-500 p-2 rounded text-white"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-blue-500 p-2 rounded text-white font-semibold"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
