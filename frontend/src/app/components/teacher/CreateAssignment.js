import { useState } from "react";
import axios from "axios";

export default function CreateAssignment({ course, setActiveSection }) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [subject, setSubject] = useState("");
  const [fileUrl, setFileUrl] = useState(""); //  Stores the file URL

  //  Handle file URL input
  const handleFileChange = (event) => {
    setFileUrl(event.target.value); //  Store file URL instead of a file upload
    console.log("📂 File URL:", event.target.value);
  };

  //  Send JSON request with the file URL
  const handleCreate = async () => {
    if (!title || !dueDate || !dueTime || !subject || !fileUrl) {
      alert("Please fill in all required fields.");
      return;
    }

    const requestData = {
      title,
      instruction: instructions,
      duedate: dueDate,
      duetime: dueTime,
      subject,
      relatedfile: fileUrl, //  Send the file URL in JSON
    };

    console.log(" Final requestData:", requestData);

    try {
      await axios.post(
        "http://localhost:5001/api/v1/teacher/assignments", //  Sending JSON request to the same API
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Assignment Created Successfully!");
      setActiveSection("Assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment.");
    }
  };

  return (
    <div className="bg-[#23273D] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4"> Create Assignment for {course}</h2>

      {/* Title Input */}
      <label className="block mb-2">Assignment Title *</label>
      <input
        type="text"
        className="w-full p-2 mb-4 bg-[#2D314B] text-white rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Instructions Input */}
      <label className="block mb-2">Assignment Instructions</label>
      <textarea
        className="w-full p-2 mb-4 bg-[#2D314B] text-white rounded"
        rows="4"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      ></textarea>

      {/* Subject Input */}
      <label className="block mb-2">Subject *</label>
      <input
        type="text"
        className="w-full p-2 mb-4 bg-[#2D314B] text-white rounded"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      {/* Due Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Due Date *</label>
          <input
            type="date"
            className="w-full p-2 bg-[#2D314B] text-white rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2">Due Time *</label>
          <input
            type="time"
            className="w-full p-2 bg-[#2D314B] text-white rounded"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>
      </div>

      {/* File URL Input */}
      <div className="mt-4">
        <label className="block mb-2">File URL *</label>
        <input
          type="text"
          className="w-full p-2 mb-4 bg-[#2D314B] text-white rounded"
          placeholder="Enter file URL (e.g., https://example.com/file.pdf)"
          value={fileUrl}
          onChange={handleFileChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition" onClick={handleCreate}>
          Create Assignment
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition" onClick={() => setActiveSection("Assignments")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
