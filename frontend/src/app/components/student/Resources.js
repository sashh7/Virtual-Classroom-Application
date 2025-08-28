"use client";

import { useEffect, useState } from "react";
import { FaFileAlt, FaFolder, FaPlus, FaUpload } from "react-icons/fa";
import axios from "axios";

export default function Resources({ course, setActiveSection }) {
  const [resources, setResources] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [resourceName, setResourceName] = useState(""); // New state for resource name
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not authenticated. Please log in.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/api/v1/resources/${course}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResources(response.data.resources);
        console.log(response.data.resources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    if (course) {
      fetchResources();
    }
  }, [course]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile || !subject || !resourceName) {
      alert("Please select a file and enter both subject and resource name.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated. Please log in.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", subject);
      formData.append("resourceName", resourceName); // Append resource name

      const response = await axios.post(
        "http://localhost:5001/api/v1/resources/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Upload Response:", response.data);

      setResources((prevResources) => [
        ...prevResources,
        response.data.resource,
      ]);
      setShowUpload(false);
      setSelectedFile(null);
      setSubject("");
      setResourceName(""); // Clear the resource name field
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      alert("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    return fileName.endsWith(".zip") || fileName.endsWith(".rar") ? (
      <FaFolder className="text-gray-400 text-2xl" />
    ) : (
      <FaFileAlt className="text-gray-400 text-2xl" />
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{course} Resources</h2>

      <div className="mb-4 flex justify-between items-center">
        <span className="text-gray-300 italic">
          Manage your course resources
        </span>

      </div>

      {showUpload && (
        <div className="bg-[#23273D] p-4 rounded-lg shadow-md mb-4">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="bg-gray-700 text-white p-2 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="resourceName" className="text-gray-300">
                Resource Name
              </label>
              <input
                type="text"
                id="resourceName"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="Enter resource name"
                className="bg-gray-700 text-white p-2 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="fileUpload" className="text-gray-300">
                Upload File
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="bg-gray-700 text-white p-2 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className={`bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-600 transition ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaUpload /> {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center font-semibold">
          Loading resources...
        </p>
      ) : resources.length > 0 ? (
        resources.map((resource, index) => (
          <div
            key={index}
            className="bg-[#23273D] p-4 rounded-lg shadow-md mb-4 flex items-center gap-4"
          >
            {getFileIcon(resource.fileUrl)}
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                Resource Name: {resource.name}
              </h3>
              <p className="text-gray-300">Subject: {resource.subject}</p>
              <p className="italic text-gray-300">
                Uploaded by {resource.uploadedBy}
              </p>
              <a
                href={`http://localhost:5001${resource.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {resource.fileUrl.split("/").pop()}
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center font-semibold">
          No Resources Available
        </p>
      )}

      <button
        className="mt-6 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        onClick={() => {
          if (typeof setActiveSection === "function") {
            setActiveSection("CourseActions");
          } else {
            console.error("setActiveSection is not a function");
          }
        }}
      >
        Back to Course
      </button>
    </div>
  );
}
