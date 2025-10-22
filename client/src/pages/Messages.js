import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import "../styles/Messages.css"
import SendIcon from '@mui/icons-material/Send'
import ThreePOutlinedIcon from '@mui/icons-material/ThreePOutlined';
import socket from "../socket";

const Messages = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null); // reference to bottom of chat
   

    //  Auto scroll to bottom when conversation updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // Register user socket connection
  useEffect(() => {
   if (user?.id) {
    socket.connect();
    socket.emit("register", user.id);
  }
  return () => {
    socket.disconnect();
  };
  }, [user.id]);

  //fetch contact list
  useEffect(() => {
    axios.get('http://localhost:5000/api/messages/contacts', {
      params: {
        userId: user.id,
        role: user.role
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setContacts(res.data))
    .catch(err => console.error(err));
  }, [user, token]);

  const loadConversation = (contact) => {
    setSelectedContact(contact);

    axios.get('http://localhost:5000/api/messages/conversation', {
      params: {
        sender_id: user.id,
        receiver_id: contact.id
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setConversation(res.data))
    .catch(err => console.error(err));
  };

//Listen for incoming messages
 useEffect(() => {
 socket.on("receiveMessage", (msg)=>{
  if(selectedContact && 
    (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id
  ) ){
    setConversation(prev => [...prev, msg])
  }
 })
      return () => {
      socket.off("receiveMessage");
    };

 }, [selectedContact]);

 // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const msgData = {
      sender_id: user.id,
      receiver_id: selectedContact.id,
      message: newMessage,
    };

    // Send through socket (no axios)
    socket.emit("sendMessage", msgData);

    setNewMessage("");
  };
  return (
    <div className="message-page">
      <div className="contacts-list">
      

        <h3>Contacts <ThreePOutlinedIcon className="pageIcon"/></h3>
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
            onClick={() => loadConversation(contact)}
          >
              <div className="contact-info">
            <strong>{contact.full_name} </strong><small>{contact.email}</small>
          </div>
            </div>
        ))}
      </div>
     
      <div className="chat-box">
        {selectedContact ? (
          <>
            <h3>Chat with {selectedContact.name}</h3>
            <div className="chat-messages">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                   className={`chat-message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content"
                 
                  >
                    {msg.message}
                  </div>
                
                 <div className="message-time">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              ))}
                <div ref={chatEndRef}></div> {/* dummy div to scroll into view */}
            </div>
            <div className="chat-input">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
            
              />
              <button onClick={sendMessage}><SendIcon/></button>
            </div>
          </>
        ) : (
            <p className="no-contact">Select a contact to start chatting</p>
            
        )}
      </div>
    </div>
  );
};

export default Messages;
