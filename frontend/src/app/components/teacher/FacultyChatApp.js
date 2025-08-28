import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function FacultyChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [students, setStudents] = useState([]);  // Store students properly
  const [selectedStudent, setSelectedStudent] = useState(null);
  const chatContainerRef = useRef(null);

  // Get logged-in faculty info from local storage
  const [faculty, setFaculty] = useState({ name: "", role: "" });

  useEffect(() => {
    try {
      // Retrieve token from localStorage and parse it
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setFaculty(storedUser); // Set faculty name and role
      }
      fetchStudents(storedUser?.name); // Fetch students who messaged this faculty
    } catch (error) {
      console.error("Error retrieving faculty info:", error);
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) fetchMessages();
  }, [selectedStudent]);

  // Fetch students who have messaged the faculty
  const fetchStudents = async (facultyName) => {
    console.log("inside fetch studets name")
    if (!facultyName) return;
    try {
      const response = await axios.get(`http://localhost:5001/api/faculty/${facultyName}/students`);
      
      // Ensure response is an array of student names
      const studentList = response.data.students.map((name) => ({ name })); 
      setStudents(studentList);
      console.log("Students fetched:", studentList);  // Debugging
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch messages between faculty and selected student
  const fetchMessages = async () => {
    if (!selectedStudent || !faculty.name) return;
    try {
      const response = await axios.get(
        `http://localhost:5001/api/${faculty.name}/${selectedStudent.name}`
      );
      setMessages(response.data.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send message from faculty to selected student
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !faculty.name) return;

    const receiver = {
      name: selectedStudent.name,
      role: selectedStudent.role || "student",
    };

    try {
      const response = await axios.post("http://localhost:5001/api/send", {
        sender: faculty,
        receiver,
        message: newMessage,
      });

      setMessages([...messages, response.data.data]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <div className="chat-container bg-[#222539] p-6 rounded-lg shadow-md text-white">
      <h2 className="text-lg font-bold mb-2">Chat with Students</h2>

      <label>Select Student:</label>
      <select
        onChange={(e) =>
          setSelectedStudent(students.find((student) => student.name === e.target.value))
        }
        className="w-full p-2 bg-gray-800 text-white rounded-lg mt-2"
      >
        <option value="">-- Choose Student --</option>
        {students.length > 0 ? (
          students.map((student, index) => (
            <option key={index} value={student.name}>
              {student.name}
            </option>
          ))
        ) : (
          <option disabled>No students found</option>
        )}
      </select>

      {selectedStudent && (
        <>
          <p className="mt-2">
            Chatting with: <strong>{selectedStudent.name}</strong>
          </p>
          <div
            ref={chatContainerRef}
            className="chat-box h-64 overflow-y-auto border p-2 rounded-lg mt-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender.name === faculty.name ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`bubble p-2 rounded-lg inline-block ${
                    msg.sender.name === faculty.name ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  <strong>{msg.sender.name}:</strong> {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input mt-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-gray-800 text-white rounded-l-lg border"
            />
            <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-r-lg">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
