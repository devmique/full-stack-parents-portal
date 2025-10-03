import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Messages.css"
import SendIcon from '@mui/icons-material/Send'
const Messages = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));


  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    axios.get('http://localhost:5000/api/messages/contacts', {
      params: {
        userId: user.id,
        role: user.role
      }
    })
    .then(res => setContacts(res.data))
    .catch(err => console.error(err));
  }, [user]);

  const loadConversation = (contact) => {
    setSelectedContact(contact);

    axios.get('http://localhost:5000/api/messages/conversation', {
      params: {
        sender_id: user.id,
        receiver_id: contact.id
      }
    })
    .then(res => setConversation(res.data))
    .catch(err => console.error(err));
  };
useEffect(() => {
  if (!selectedContact) return;

  const interval = setInterval(() => {
    axios.get('http://localhost:5000/api/messages/conversation', {
      params: {
        sender_id: user.id,
        receiver_id: selectedContact.id
      }
    })
    .then(res => setConversation(res.data))
    .catch(err => console.error(err));
  }, 1000); 

  return () => clearInterval(interval); 
}, [selectedContact, user.id]);


  const sendMessage = () => {
    if (!newMessage.trim()) return;
    axios.post('http://localhost:5000/api/messages', {
      sender_id: user.id,
      receiver_id: selectedContact.id,
      message: newMessage
    })
    .then(() => {
      setConversation([...conversation, {
        sender_id: user.id,
        receiver_id: selectedContact.id,
        message: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage("");
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="message-page">
      <div className="contacts-list">
      

        <h3>Contacts</h3>
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
