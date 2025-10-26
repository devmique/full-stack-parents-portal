import React, { useState } from "react";
import '../styles/Chatbot.css'
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios"
import SendIcon from '@mui/icons-material/Send'
function Chatbot({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your Parents Portal Assistant" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setOpen(!open);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chatbot", {
        message: input,
        user,
      });

      const reply = res.data.reply;

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection error. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
     <div className="chatbot-toggle" onClick={toggleChat}>
  {open ? <CloseIcon fontSize="medium" /> : <ChatIcon fontSize="medium" />}
 </div>


      {/* Chat Popup */}
      {open && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            School Assistant
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="msg bot">Typing...</div>}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}><SendIcon/></button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
