import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
const NotificationMenu = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.emit("register", user.id);

    socket.on("newNotification", (notif) => {
   
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });


    return () => socket.disconnect();
  }, [user.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          params: { user_id: user.id },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const data = res.data;
        setNotifications(data);
        setUnreadCount(data.filter((n) => n.read_status === 0).length);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifications();
  }, [user.id]);

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/mark-all-read",
        { userId: user.id },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const toggleNotifDropdown = () => {
    setOpenNotif((prev) => !prev);
    if (!openNotif) markAllAsRead();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={notifRef} className="notif-section" onClick={toggleNotifDropdown} style={{position:"relative"}}>
      <button className="notification-btn">
        {unreadCount > 0 ? (
          <NotificationsActiveOutlinedIcon style={{ color: "rgba(6, 65, 167, 0.872)" }} />
        ) : (
          <NotificationsNoneIcon />
        )}
      </button>
      <div className={`notif-dropdown ${openNotif ? "open" : ""}`}>
        <ul>
          {notifications.length === 0 ? (
            <li>No notifications yet</li>
          ) : (
            notifications
              .slice()
              .reverse()
              .slice(0, 100)
              .map((notif, i) => (
                <li key={i} className="notif-item">
                  {notif.message}
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationMenu;
