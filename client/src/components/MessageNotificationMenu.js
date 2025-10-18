import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MarkunreadOutlinedIcon from "@mui/icons-material/MarkunreadOutlined";
import socket from "../socket";



const MessageNotificationMenu = ({ user }) => {
  const [messageNotifs, setMessageNotifs] = useState([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [openMessageNotif, setOpenMessageNotif] = useState(false);
  const msgNotifRef = useRef(null);

useEffect(() => {

 if (user?.id) {
    socket.emit("register", user.id);
    socket.on("newMsgNotification", (notif) => {
    setMessageNotifs((prev) => [notif, ...prev]);
    setUnreadMsgCount((prev) => prev + 1);
    });
  }


     return () => {
    socket.off("newMsgNotification");
     }
  }, [user.id]);

  useEffect(() => {
    const fetchMessageNotifs = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messagenotif?userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const data = res.data;
        setMessageNotifs(data);
        setUnreadMsgCount(data.filter((msg) => !msg.read_status).length);
      } catch (err) {
        console.error("Failed to load message notifications", err);
      }
    };

    fetchMessageNotifs();
  }, [user.id]);

  const markAllMessagesAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/messagenotif/mark-all-read",
        { userId: user.id },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );

      setMessageNotifs((prev) => prev.map((msg) => ({ ...msg, read_status: true })));
      setUnreadMsgCount(0);
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const toggleMessageNotifDropdown = () => {
    const newState = !openMessageNotif;
    setOpenMessageNotif(newState);
    if (!openMessageNotif) markAllMessagesAsRead();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (msgNotifRef.current && !msgNotifRef.current.contains(event.target)) {
        setOpenMessageNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
      
  return (
    <div ref={msgNotifRef} className="message-notif-section" onClick={toggleMessageNotifDropdown}  style={{position:"relative"}}>
      <button className="messageNotif-btn">
        {unreadMsgCount > 0 ? (
          <MarkEmailUnreadOutlinedIcon style={{ color: "rgba(6, 65, 167, 0.872)" }} />
        ) : (
          <MarkunreadOutlinedIcon />
        )}
      </button>
      <div className={`messagenotif-dropdown ${openMessageNotif ? "open" : ""}`}>
        <ul>
          {messageNotifs.length === 0 ? (
            <li>No new messages</li>
          ) : (
            messageNotifs
              .slice()
              .reverse()
              .slice(0, 100)
              .map((msg, i) => (
                <li key={i} className="message-item">
                  {msg.message}
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MessageNotificationMenu;
