import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationMenu from "./NotificationMenu";
import MessageNotificationMenu from "./MessageNotificationMenu";
import "../styles/DashboardHeader.css";
import axios from "axios"
import Logo from "../assets/logo.png"; 
import { io } from "socket.io-client";

const DashboardHeader = () => {

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const profileRef = useRef(null);
 


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
    { name: "Profile", path: "/profile"},
    { name: "Help", path: "/help"},
    { name: "Settings", path: "/settings" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
     
         <MessageNotificationMenu user={user} />
        <NotificationMenu user={user} />

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
