import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as XLSX from "xlsx";

const socket = io("http://localhost:5002");

// Button color constants for consistency
const BUTTON_COLORS = {
  PRIMARY: "#3b82f6",      // Blue
  SECONDARY: "#4b5563",    // Gray
  SUCCESS: "#10b981",      // Green
  WARNING: "#f59e0b",      // Yellow/Orange
  DANGER: "#ef4444",       // Red
  LEAVE: "#dc2626",        // Dark Red
  ACTIVE: "#2563eb",       // Darker Blue
  MUTED: "#ef4444",        // Red
  VIDEO_OFF: "#ef4444",    // Red
  SCREEN_SHARING: "#3b82f6" // Blue
};

const App = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedLineWidth, setSelectedLineWidth] = useState(2);
  const [raisedHands, setRaisedHands] = useState([]);
  const [selectedHours, setSelectedHours] = useState("1"); // Default set to 1 class

  const localStream = useRef(null);
  const screenStream = useRef(null);
  const peerConnections = useRef({});
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // Socket event handlers
  useEffect(() => {
    if (!rollNumber) return;

    const socketEventHandlers = {
      "update-participants": handleUpdateParticipants,
      "new-user": handleNewUser,
      "offer": handleOffer,
      "answer": handleAnswer,
      "ice-candidate": handleIceCandidate,
      "chat-message": handleChatMessage,
      "draw": handleDraw,
      "hand-raised": handleHandRaised,
      "hand-lowered": handleHandLowered,
      "update-raised-hands": setRaisedHands
    };

    // Clean up existing listeners
    Object.keys(socketEventHandlers).forEach(event => {
      socket.off(event);
    });

    // Set up new listeners
    Object.entries(socketEventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(socketEventHandlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [rollNumber]);

  // Canvas setup
  useEffect(() => {
    if (joined && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = selectedLineWidth;
    }
  }, [joined, selectedColor, selectedLineWidth]);

  // Socket event handler functions
  const handleUpdateParticipants = (users) => {
    console.log("Updated participants list:", users);

    // Setup new connections
    users.forEach((user) => {
      if (user !== rollNumber && !peerConnections.current[user]) {
        setupPeerConnection(user, rollNumber < user);
      }
    });

    // Clean up disconnected users
    Object.keys(peerConnections.current).forEach((user) => {
      if (!users.includes(user) && user !== rollNumber) {
        console.log(`Participant left: ${user}`);
        peerConnections.current[user].close();
        delete peerConnections.current[user];

        setParticipants(prev => {
          const updated = { ...prev };
          delete updated[user];
          return updated;
        });

        setRaisedHands(prev => prev.filter(id => id !== user));
      }
    });
  };

  const handleNewUser = (newUser) => {
    if (newUser !== rollNumber && !peerConnections.current[newUser]) {
      setupPeerConnection(newUser, rollNumber < newUser);
    }
  };

  const handleOffer = async ({ from, offer }) => {
    if (!peerConnections.current[from]) {
      setupPeerConnection(from, false);
    }
    const pc = peerConnections.current[from];
    if (pc.signalingState === "stable") {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    }
  };

  const handleAnswer = async ({ from, answer }) => {
    const pc = peerConnections.current[from];
    if (pc && pc.signalingState !== "stable") {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async ({ from, candidate }) => {
    const pc = peerConnections.current[from];
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleChatMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleDraw = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    switch (data.type) {
      case "start":
        ctx.beginPath();
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.moveTo(data.x, data.y);
        break;
      case "draw":
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        break;
      case "end":
        ctx.closePath();
        break;
      case "clear":
        clearWhiteboard();
        break;
      default:
        break;
    }
  };

  const handleHandRaised = (userId) => {
    setRaisedHands(prev => [...prev, userId]);
  };

  const handleHandLowered = (userId) => {
    setRaisedHands(prev => prev.filter(id => id !== userId));
  };

  // WebRTC functions
  const setupPeerConnection = (id, initiateOffer = false) => {
    if (peerConnections.current[id]) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peerConnections.current[id] = pc;

    // Add local tracks if available
    [localStream.current, screenStream.current].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }
    });

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        setParticipants(prev => ({ ...prev, [id]: event.streams[0] }));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: id, candidate: event.candidate });
      }
    };

    pc.onnegotiationneeded = async () => {
      if (initiateOffer) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: id, offer: pc.localDescription });
        } catch (err) {
          console.error(`Error during negotiation with ${id}:`, err);
        }
      }
    };

    if (initiateOffer) {
      setTimeout(async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: id, offer: pc.localDescription });
        } catch (err) {
          console.error(`Error creating offer for ${id}:`, err);
        }
      }, 1000);
    }
  };

  // Room functions
  const joinMeet = () => {
    if (!rollNumber.trim()) {
      alert("Please enter your roll number to join");
      return;
    }

    socket.emit("join-room", rollNumber, (response) => {
      if (response.error) {
        alert(response.error);
        return;
      }

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStream.current = stream;
          setParticipants(prev => ({ ...prev, [rollNumber]: stream }));
          setJoined(true);
          socket.emit("new-user", rollNumber);
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
          alert("Could not access camera or microphone. Please check permissions.");
        });
    });
  };

  const leaveRoom = () => {
    // Stop all media streams
    [localStream.current, screenStream.current].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    // Reset state
    setParticipants({});
    setJoined(false);
    setMessages([]);
    setIsWhiteboardOpen(false);
    setRaisedHands([]);

    // Reconnect socket
    socket.disconnect();
    socket.connect();
  };

  // Media control functions
  const toggleMute = () => {
    if (localStream.current) {
      const audioTracks = localStream.current.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTracks = localStream.current.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStream.current.getTracks().forEach(track => track.stop());
      screenStream.current = null;
      setIsScreenSharing(false);

      // Restore camera video tracks
      Object.values(peerConnections.current).forEach(pc => {
        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender && localStream.current) {
          const videoTrack = localStream.current.getVideoTracks()[0];
          if (videoTrack) videoSender.replaceTrack(videoTrack);
        }
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        screenStream.current = stream;
        setIsScreenSharing(true);

        // Replace video tracks with screen share
        Object.values(peerConnections.current).forEach(pc => {
          const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (videoSender) {
            const screenTrack = stream.getVideoTracks()[0];
            if (screenTrack) videoSender.replaceTrack(screenTrack);
          }
        });

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = toggleScreenShare;
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  // Hand raise functions
  const raiseHand = () => {
    if (raisedHands.includes(rollNumber)) {
      socket.emit("lower-hand", rollNumber);
    } else {
      socket.emit("raise-hand", rollNumber);
    }
  };

  // Whiteboard functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    isDrawing.current = true;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit("draw", {
      type: "start",
      x,
      y,
      color: selectedColor,
      lineWidth: selectedLineWidth,
    });
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", { type: "draw", x, y });
  };

  const endDrawing = () => {
    isDrawing.current = false;
    socket.emit("draw", { type: "end" });
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("draw", { type: "clear" });
  };

  // Attendance functions
  const downloadAttendance = () => {
    const data = Object.keys(participants).map((roll) => ({
      "Roll No": roll,
      "Classes Taken": selectedHours,
      "Present": participants[roll] ? "Yes" : "No"
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
  };

  // Chat functions
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat-message", {
        rollNumber,
        message,
        timestamp: new Date().toISOString(),
      });
      setMessage("");
    }
  };

  // Render functions
  const renderJoinForm = () => (
    <div style={styles.joinContainer}>
      <h2 style={styles.joinTitle}>Join Meeting</h2>
      <div style={styles.joinForm}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && joinMeet()}
        />
        <button style={styles.joinButton} onClick={joinMeet}>
          Join Room
        </button>
      </div>
    </div>
  );

  const renderControlButtons = () => (
    <div style={styles.controls}>
      {/* Mute Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: isMuted ? BUTTON_COLORS.MUTED : BUTTON_COLORS.SECONDARY
        }}
        onClick={toggleMute}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>

      {/* Video Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: isVideoOff ? BUTTON_COLORS.VIDEO_OFF : BUTTON_COLORS.SECONDARY
        }}
        onClick={toggleVideo}
      >
        {isVideoOff ? "Turn Video On" : "Turn Video Off"}
      </button>

      {/* Screen Share Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: isScreenSharing ? BUTTON_COLORS.SCREEN_SHARING : BUTTON_COLORS.SECONDARY
        }}
        onClick={toggleScreenShare}
      >
        {isScreenSharing ? "Stop Sharing" : "Share Screen"}
      </button>

      {/* Hand Raise Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: raisedHands.includes(rollNumber) ? BUTTON_COLORS.WARNING : BUTTON_COLORS.SECONDARY
        }}
        onClick={raiseHand}
      >
        {raisedHands.includes(rollNumber) ? "Lower Hand ✋" : "Raise Hand"}
      </button>

      {/* Whiteboard Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: isWhiteboardOpen ? BUTTON_COLORS.ACTIVE : BUTTON_COLORS.PRIMARY
        }}
        onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
      >
        {isWhiteboardOpen ? "Hide Whiteboard" : "Show Whiteboard"}
      </button>

      {/* Hours Dropdown and Attendance Button */}
      <div style={styles.attendanceContainer}>
        <select
          value={selectedHours}
          onChange={(e) => setSelectedHours(e.target.value)}
          style={styles.hoursDropdown}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
            <option key={hours} value={hours}>
              {hours} hour{hours !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <button
          style={{
            ...styles.controlButton,
            backgroundColor: BUTTON_COLORS.SUCCESS
          }}
          onClick={downloadAttendance}
        >
          Download Attendance
        </button>
      </div>

      {/* Leave Button */}
      <button
        style={{
          ...styles.controlButton,
          backgroundColor: BUTTON_COLORS.LEAVE
        }}
        onClick={leaveRoom}
      >
        Leave
      </button>
    </div>
  );

  const renderRaisedHands = () => (
    raisedHands.length > 0 && (
      <div style={styles.raisedHandsContainer}>
        <h3 style={styles.raisedHandsTitle}>Raised Hands:</h3>
        <div style={styles.raisedHandsList}>
          {raisedHands.map(id => (
            <span key={id} style={styles.raisedHandBadge}>
              {id === rollNumber ? "You ✋" : `${id} ✋`}
            </span>
          ))}
        </div>
      </div>
    )
  );

  const renderVideoGrid = () => (
    <div style={styles.videoGrid}>
      {Object.entries(participants).map(([id, stream]) => (
        <div key={id} style={styles.videoWrapper}>
          <video
            style={styles.video}
            autoPlay
            playsInline
            muted={id === rollNumber}
            ref={(el) => el && stream && (el.srcObject = stream)}
          />
          <div style={styles.videoOverlay}>
            <div style={styles.videoInfo}>
              <span style={styles.videoId}>
                {id === rollNumber ? `You (${id})` : id}
                {raisedHands.includes(id) && " ✋"}
              </span>
              {id === rollNumber && (
                <div style={styles.videoStatus}>
                  {isMuted && <span style={styles.statusBadge}>Muted</span>}
                  {isVideoOff && <span style={styles.statusBadge}>No Video</span>}
                  {isScreenSharing && <span style={styles.statusBadge}>Sharing</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWhiteboard = () => (
    isWhiteboardOpen && (
      <div style={styles.whiteboardContainer}>
        <div style={styles.whiteboardHeader}>
          <h3 style={styles.whiteboardTitle}>Collaborative Whiteboard</h3>
          <div style={styles.whiteboardControls}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={styles.colorPicker}
            />
            <input
              type="range"
              min="1"
              max="20"
              value={selectedLineWidth}
              onChange={(e) => setSelectedLineWidth(parseInt(e.target.value))}
              style={styles.lineWidthSlider}
            />
            <span style={styles.lineWidthLabel}>{selectedLineWidth}px</span>
            <button
              style={{
                ...styles.controlButton,
                backgroundColor: BUTTON_COLORS.DANGER
              }}
              onClick={clearWhiteboard}
            >
              Clear
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          width={800}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>
    )
  );

  const renderChat = () => (
    <div style={styles.chatContainer}>
      <h2 style={styles.chatTitle}>Chat</h2>
      <div style={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.rollNumber === rollNumber ? "flex-end" : "flex-start",
              backgroundColor: msg.rollNumber === rollNumber ? "#dbeafe" : "#f3f4f6",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span style={styles.messageSender}>
                {msg.rollNumber === rollNumber ? "You" : msg.rollNumber}
              </span>
              <span style={{ marginLeft: "10px", color: "#6b7280" }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p style={styles.messageText}>{msg.message}</p>
          </div>
        ))}
      </div>
      <div style={styles.chatInputContainer}>
        <input
          style={styles.chatInput}
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          style={{
            ...styles.controlButton,
            backgroundColor: BUTTON_COLORS.PRIMARY
          }}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Video Chat Room</h1>
      {!joined ? (
        renderJoinForm()
      ) : (
        <div style={styles.mainContainer}>
          <div style={styles.videoContainer}>
            <div style={styles.videoHeader}>
              <h2 style={styles.videoTitle}>Participants ({Object.keys(participants).length})</h2>
            </div>
            
            <div style={styles.controlsContainer}>
              {renderControlButtons()}
            </div>
            
            {renderRaisedHands()}
            {renderVideoGrid()}
            {renderWhiteboard()}
          </div>
          {renderChat()}
        </div>
      )}
    </div>
  );
};

// Styles with updated spacing for better UI
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e40af",
    marginBottom: "20px",
  },
  joinContainer: {
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  joinTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#1e40af",
  },
  joinForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "1rem",
  },
  joinButton: {
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  mainContainer: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  videoContainer: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  videoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  videoTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e40af",
  },
  controlsContainer: {
    marginBottom: "30px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  controls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  controlButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  attendanceContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  hoursDropdown: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  raisedHandsContainer: {
    backgroundColor: "#fef3c7",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  raisedHandsTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#92400e",
    marginBottom: "5px",
  },
  raisedHandsList: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  raisedHandBadge: {
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.875rem",
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "10px",
  },
  videoWrapper: {
    position: "relative",
    backgroundColor: "#000000",
    borderRadius: "8px",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  videoOverlay: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "8px",
  },
  videoInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#ffffff",
  },
  videoId: {
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  videoStatus: {
    display: "flex",
    gap: "4px",
  },
  statusBadge: {
    fontSize: "0.75rem",
    backgroundColor: "#ef4444",
    padding: "2px 4px",
    borderRadius: "4px",
  },
  whiteboardContainer: {
    marginTop: "30px",
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  whiteboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  whiteboardTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e40af",
  },
  whiteboardControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  colorPicker: {
    width: "30px",
    height: "30px",
    padding: "0",
    border: "none",
    cursor: "pointer",
  },
  lineWidthSlider: {
    width: "100px",
  },
  lineWidthLabel: {
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  canvas: {
    width: "100%",
    height: "400px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
  },
  chatContainer: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  chatTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: "20px",
  },
  chatMessages: {
    flex: "1",
    overflowY: "auto",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    padding: "10px",
    borderRadius: "8px",
    maxWidth: "80%",
  },
  messageSender: {
    fontWeight: "600",
  },
  messageText: {
    fontSize: "0.875rem",
  },
  chatInputContainer: {
    display: "flex",
    gap: "10px",
  },
  chatInput: {
    flex: "1",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "1rem",
  },
  sendButton: {
    padding: "10px 20px",
    borderRadius: "4px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
};

export default App;