"use client";
import { useState, useEffect } from "react";
import { FaEnvelope, FaIdBadge, FaChalkboardTeacher, FaEdit, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Retrieve user details from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Parse and set user data
        }
    }, []);

    if (!user) {
        return <p className="text-gray-400 text-center">Loading user details...</p>;
    }

    //  Use user's image if available, otherwise use default teacher/student images
    const profileImage = user.image
        ? user.image
        : user.role === "teacher"
        ? "/images/Teacher.jpg"  //  Correct path for teacher image
        : "/images/student.jpg"; //  Correct path for student image

    return (
        <div className="flex flex-col items-center text-white p-10 bg-[#181B2A] min-h-screen">
            {/* Profile Picture */}
            <div className="relative w-40 h-40 mb-6">
                <img
                    src={profileImage} //  Uses user's image or default if missing
                    alt="Profile"
                    className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => (e.target.src = user.role === "teacher" ? "/images/Teacher.jpg" : "/images/student.jpg")} //  Ensures fallback if image is broken
                />
            </div>

            {/* Edit Button */}
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
            >
                <FaEdit /> {isEditing ? "Save" : "Edit"}
            </button>

            {/* User Details */}
            <h2 className="text-center text-3xl font-bold mb-6">{user.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                {[
                    { icon: <FaIdBadge className="text-gray-400 text-2xl" />, name: "rollno", label: "ID" },
                    { icon: <FaEnvelope className="text-gray-400 text-2xl" />, name: "email", label: "Email", longText: true },
                    { icon: <FaChalkboardTeacher className="text-gray-400 text-2xl" />, name: "class", label: "Class" },
                    { icon: <FaPhone className="text-gray-400 text-2xl" />, name: "phone", label: "Phone Number" }
                ].map((field, index) => (
                    <div key={index} className="bg-[#23273D] p-4 rounded-lg shadow-md flex items-center gap-4 w-full">
                        {field.icon}
                        {isEditing ? (
                            <input
                                type="text"
                                name={field.name}
                                value={user[field.name] || ""}
                                onChange={(e) => setUser({ ...user, [e.target.name]: e.target.value })}
                                className="bg-transparent text-gray-300 text-lg border-b border-gray-400 focus:outline-none w-full"
                            />
                        ) : (
                            <p className={`text-gray-300 text-lg ${field.longText ? "truncate overflow-hidden" : ""}`}>
                                {user[field.name] || "N/A"}
                            </p>
                        )}
                    </div>
                ))}
                {/* Address Field */}
                <div className="bg-[#23273D] p-4 rounded-lg shadow-md flex items-center gap-4 w-full col-span-2">
                    <FaMapMarkerAlt className="text-gray-400 text-2xl" />
                    {isEditing ? (
                        <input
                            type="text"
                            name="address"
                            value={user.address || ""}
                            onChange={(e) => setUser({ ...user, [e.target.name]: e.target.value })}
                            className="bg-transparent text-gray-300 text-lg border-b border-gray-400 focus:outline-none w-full"
                        />
                    ) : (
                        <p className="text-gray-300 text-lg truncate overflow-hidden">{user.address || "No Address Available"}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
