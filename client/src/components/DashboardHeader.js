import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import MarkunreadOutlinedIcon from '@mui/icons-material/MarkunreadOutlined';
import "../styles/DashboardHeader.css";
import axios from "axios"
import Logo from "../assets/logo.png"; 
const DashboardHeader = () => {
  const [openMessageNotif, setOpenMessageNotif] = useState(false);
  const [messageNotifs, setMessageNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [openNotif, setOpenNotif]= useState(false)
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const msgNotifRef = useRef(null);


     // Get user data from session storage
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const { name, role, profilePic } = user;

const homePath =
  user?.role === "admin"
    ? "/dashboard/admin"
    : user?.role === "instructor"
    ? "/dashboard/instructor"
    : "/dashboard/parent";
  const menuItems = [
    { name: "Home", path: homePath},
    { name: "Subjects", path: "/dashboard/subjects"},
    { name: "Schedule", path: "/dashboard/schedule"},
    { name: "Grades", path: "/dashboard/grades" },
    { name: "Attendance Record", path: "/dashboard/attendance" },
    { name: "Announcements", path: "/dashboard/announcements"},
    { name: "Events", path: "/dashboard/events"},
    { name: "Messages", path: "/dashboard/messages" },
    { name: "Profile", path: "/dashboard/profile"},
    { name: "Help", path: "/dashboard/help"},
    { name: "Settings", path: "/dashboard/settings" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Notifications Logic
  const getNotifications = () => {
    return JSON.parse(sessionStorage.getItem("notifications")) || [];
  };

  const markAllAsRead = async () => {
    const readNotifs = notifications.map((n) => ({ ...n, read: true }));
    sessionStorage.setItem("notifications", JSON.stringify(readNotifs));
    setNotifications(readNotifs);
    setUnreadCount(0);
     await axios.put(`http://localhost:5000/api/notifications/mark-all-read`, 
     {studentId: user.id},
         { headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        } }
    );
  };

  const loadNotifications = () => {
    const notifs = getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  };

  const toggleNotifDropdown = () => {
    setOpenNotif(!openNotif);
    if (!openNotif) {
      markAllAsRead();
    }
  };

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications" , {
        params: user.role === 'parent' ? { student_id: user.id } : {},
       headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }

      });
      const data = await res.data;
      setNotifications(data);
      const unreadNotifications = data.filter((n) => !n.read_status);
        setUnreadCount(unreadNotifications.length);
        // Save unread notifications count to sessionStorage
        sessionStorage.setItem("unreadCount", unreadNotifications.length);
      } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 1000); 
  return () => clearInterval(interval); // Clean up
}, []);

  //Message notification
const toggleMessageNotifDropdown = () => {
  const newState = !openMessageNotif;
  setOpenMessageNotif(newState);
  if (!openMessageNotif) {
    markAllMessagesAsRead(); // mark as read when opening
  }
};

  useEffect(() => {

  const fetchMessageNotifs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messagenotif?userId=${user.id}`
          ,{
         headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }}
      );
      const data = await res.data;
      setMessageNotifs(data);
      const unreadMessages = data.filter((msg) => !msg.read_status);
      const newUnreadCount = unreadMessages.length;

  
      if (newUnreadCount !== unreadMsgCount) {
     setUnreadMsgCount(newUnreadCount);
}

    } catch (err) {
      console.error("Failed to load message notifications", err);
    }
  };

  fetchMessageNotifs();

  const interval = setInterval(fetchMessageNotifs, 1000); 
  return () => clearInterval(interval);
}, [user.id]);

const markAllMessagesAsRead = async () => {
  try {
    // Send request to mark all messages as read in the database
    await axios.put(`http://localhost:5000/api/messagenotif/mark-all-read`, 
      {userId: user.id},
     { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }}
    );

    // Update local state
    const updatedMessages = messageNotifs.map((msg) => ({
      ...msg,
      read_status: true,
    }));

    setMessageNotifs(updatedMessages);
    setUnreadMsgCount(0);
    sessionStorage.setItem("unreadMsgCount", 0);
  } catch (err) {
    console.error("Failed to mark messages as read", err);
  }
};


  

  // Logout Function
const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      sessionStorage.clear();
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");

      navigate("/");
    }
  };

  
 useEffect(() => {
  const handleClickOutside = (event) => {
    // Close profile dropdown
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setOpen(false);
    }
    // Close notification dropdown
    if (notifRef.current && !notifRef.current.contains(event.target)) {
      setOpenNotif(false);
    }
    // Close message notification dropdown
    if (msgNotifRef.current && !msgNotifRef.current.contains(event.target)) {
      setOpenMessageNotif(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className="dashboard-header">
     
       <div className="sidebar-logo" style={{margin:"0 10px 20px 0"}}>
                <Link to={homePath} >
                  <img style={{ width: "40px" }} src={Logo} alt="School Logo" className="logo" />
                  </Link>
              <span className="school-name">Don Bosco College</span>
              </div>

               <div className="header-right">
      {/* Search Bar */}
      <div className="search-container">
       <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownVisible(e.target.value.length > 0);
          }}
        />
        {isDropdownVisible && (
          <div className="search-dropdown">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="search-item"
                  onClick={() => { setSearchTerm("")
                    setIsDropdownVisible(false);
                  }
                  }
                >
                  {item.name}
                </Link>
              ))
            ) : (
              <p className="no-results">No matches found</p>
            )}
            </div>
            
          )}
          </div>
      </div>
   

 
      {/* Notifications & Profile */}
     
        {/* Notification Button */}
       <div ref={msgNotifRef} className="message-notif-section" onClick={toggleMessageNotifDropdown} style={{ position: "relative" }}>
       <button className="messageNotif-btn">
    { unreadMsgCount >0 ?<MarkEmailUnreadOutlinedIcon/>:  <MarkunreadOutlinedIcon/>}
          </button>
          
                 {/* Message Notification Dropdown */}
    
  <div className={`messagenotif-dropdown ${openMessageNotif ? "open" : ""}`}>
    <ul>
      {messageNotifs.length === 0 ? (
        <li>No new messages</li>
      ) : (
        messageNotifs
          .slice()
          .reverse()
          .slice(0, 100)
          .map((msg, index) => (
            <li key={index} style={{ padding: "5px 10px", borderBottom: "1px solid #eee" }}>
              {msg.message}
            </li>
          ))
      )}
    </ul>
  </div>
</div>

        <div ref={notifRef} className="notif-section" onClick={toggleNotifDropdown} style={{ position: "relative" }}>
          <button className="notification-btn">
           {unreadCount>0? <NotificationsActiveOutlinedIcon/>: <NotificationsNoneIcon />} 
            </button>
          
            {/* Notification Dropdown */}
        <div className={`notif-dropdown ${openNotif ? "open" : ""}`}>
          <ul>
            {notifications.length === 0 ? (
              <li>No notifications yet</li>
            ) : (
              notifications
                .slice()
                .reverse()
                .slice(0, 100)
                .map((notif, index) => (
                  <li key={index} style={{ padding: "5px 10px", borderBottom: "1px solid #eee" }}>
                    {notif.message}
                  </li>
                ))
            )}
          </ul>
        </div>
        </div>

        {/* Profile Section */}
        <div ref={profileRef} className="profile-section" onClick={() => setOpen(!open)} style={{position:"relative"}}>
          <img src={profilePic || "/default-profile.png"} alt="Profile" className="profile-pic" />
          <div className="user-info">
            <span className="user-name">{name || "User"}</span>
            <small className="user-role">{role || "Unknown Role"}</small>
          </div>
       


      {/* Dropdown Menu */}
     
        <div className={`dropdown ${open ? "open" : ""}`}>
          <ul>
            <li className="pfp"onClick={() => navigate("/profile")}>
              <AccountCircleIcon style={{fontSize:"20px"}} className="headerIcon" /> Profile
            </li>
           
            <li className="settings"onClick={() => navigate("/settings")}>
              <SettingsOutlinedIcon style={{fontSize:"20px"}} className="headerIcon" /> Settings
            </li>
             <li className="logoutBtn" onClick={handleLogout}>
              <LogoutIcon style={{fontSize:"20px"}} className="headerIcon" /> Logout
            </li>
          </ul>
        </div>
      </div>

      </div>

      



    </div>
  );
};

export default DashboardHeader;
