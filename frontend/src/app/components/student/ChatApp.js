import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const chatContainerRef = useRef(null);

  // Get logged-in user info from local storage
  const [user, setUser] = useState({ name: "", role: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    fetchFacultyMembers();
  }, []);

  useEffect(() => {
    if (selectedFaculty) fetchMessages();
  }, [selectedFaculty]);

  const fetchFacultyMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/faculty");
      setFaculties(response.data.faculties);
    } catch (error) {
      console.error("Error fetching faculty members:", error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedFaculty) return;
  
    try {
      const response = await axios.get(
        `http://localhost:5001/api/chatBetweenUsers`,
        {
          params: {
            senderName: user.name,
            senderRole: user.role,
            receiverName: selectedFaculty.name,
            receiverRole: selectedFaculty.role || "teacher",
          },
        }
      );
  
      setMessages(response.data.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFaculty) return;

    // Ensure receiver has a role
    const receiver = {
      name: selectedFaculty.name,
      role: selectedFaculty.role || "teacher",
    };

    try {
      const response = await axios.post("http://localhost:5001/api/send", {
        sender: user, // Use logged-in user as sender
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
      <h2 className="text-lg font-bold mb-2">Chat with Faculty</h2>

      <label>Select Faculty:</label>
      <select
        onChange={(e) =>
          setSelectedFaculty(
            faculties.find((faculty) => faculty.name === e.target.value)
          )
        }
        className="w-full p-2 bg-gray-800 text-white rounded-lg mt-2"
      >
        <option value="">-- Choose Faculty --</option>
        {faculties.map((faculty) => (
          <option key={faculty.email} value={faculty.name}>
            {faculty.name}
          </option>
        ))}
      </select>

      {selectedFaculty && (
        <>
          <p className="mt-2">
            Chatting with: <strong>{selectedFaculty.name}</strong>
          </p>
          <div
            ref={chatContainerRef}
            className="chat-box h-64 overflow-y-auto border p-2 rounded-lg mt-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender.name === user.name ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`bubble p-2 rounded-lg inline-block ${
                    msg.sender.name === user.name ? "bg-pink-500" : "bg-gray-700"
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
            <button onClick={sendMessage} className="p-2 bg-pink-500 text-white rounded-r-lg">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
