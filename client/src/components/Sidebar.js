import React, {useState} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Logo from "../assets/logo.png"; // Ensure your logo is in `src/assets/`
import "../styles/Sidebar.css";
import { 
   FaXmark, FaBars} from "react-icons/fa6";

const Sidebar = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true); //  Open by default on large screens
 
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }



  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
   // Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      sessionStorage.clear();
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      navigate("/");
    }
  };
  
    

   const homePath = user?.role === "admin"
    ? "/dashboard/admin"
    : user?.role === "instructor"
    ? "/dashboard/instructor"
    : "/dashboard/parent";
  return (
<>
    {/* ✅ Toggle Button (Only Shows on Small Screens) */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaXmark /> : <FaBars />}
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo & School Name Section */}
       
        <div className="sidebar-logo">
          <Link to={homePath} >
            <img style={{ width: "40px" }} src={Logo} alt="School Logo" className="logo" />
            </Link>
        <span className="school-name">Don Bosco College</span>
        </div>
        
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu">
         <h3 className="menu-title">Menu</h3> 
         <Link to={homePath} className={`sidebar-item ${location.pathname === homePath ? "active" : ""}`}>
          {location.pathname === homePath ? <HomeWorkIcon className="icon"/>:<MapsHomeWorkOutlinedIcon className="icon" />} Home
        </Link>
        <Link to="/dashboard/subjects" className={`sidebar-item ${location.pathname === "/dashboard/subjects" ? "active" : ""}`}>
          {location.pathname === "/dashboard/subjects"? <LibraryBooksIcon className="icon"/>:<LibraryBooksOutlinedIcon className="icon" />} Subjects 
        </Link>
         <Link to="/dashboard/schedule" className={`sidebar-item ${location.pathname === "/dashboard/schedule" ? "active" : ""}`}>
          {location.pathname === "/dashboard/schedule"? <EventNoteIcon className="icon"/>:<EventNoteOutlinedIcon className="icon" />}Schedule
        </Link>
        {user.role!=="admin" && (
          <>
        <Link to="/dashboard/grades"className={`sidebar-item ${location.pathname === "/dashboard/grades" ? "active" : ""}`}>
          {location.pathname==="/dashboard/grades"? <SchoolIcon className="icon"/>: <SchoolOutlinedIcon className="icon" />} Grades
        </Link>
        <Link to="/dashboard/attendance" className={`sidebar-item ${location.pathname === "/dashboard/attendance" ? "active" : ""}`}>
          <ChecklistOutlinedIcon className="icon" /> Attendance Record
        </Link>
        </>
        )}
        <Link to="/dashboard/announcements" className={`sidebar-item ${location.pathname === "/dashboard/announcements" ? "active" : ""}`}>
          {location.pathname==="/dashboard/announcements"? <CampaignIcon className="icon"/>: <CampaignOutlinedIcon className="icon" />} Announcements 
        </Link>
         <Link to="/dashboard/events"className={`sidebar-item ${location.pathname === "/dashboard/events"? "active" : ""}`}>
          {location.pathname ==="/dashboard/events"? <CalendarTodayIcon className="icon"/>:<CalendarTodayOutlinedIcon className="icon" />}Events
        </Link>
        <Link to= "/dashboard/messages"  className={`sidebar-item ${location.pathname === "/dashboard/messages" ? "active" : ""}`}>
          {location.pathname==="/dashboard/messages"? <ChatBubbleIcon className="icon"/>: <ChatBubbleOutlineOutlinedIcon className="icon" />} Messages
        </Link>
      </div>

        {/* Other Section at Bottom */}
      <div className="sidebar-other">
        <h3 className="menu-title">Other</h3>
       <Link to="/profile" className="sidebar-item">
  <AccountCircleOutlinedIcon className="icon" /> Profile
</Link>

        <Link to="/help" className="sidebar-item">
          <HelpOutlineOutlinedIcon className="icon" /> Help
          </Link>
          <Link to="/settings" className="sidebar-item">
          <SettingsOutlinedIcon className="icon" /> Settings
          </Link>
          <button style={{ margin: "0 0 20px 1px" }} className="sidebar-item logout-btn" onClick={handleLogout}>
        <LogoutIcon/> Log out 
        </button>
      </div>
    </div>
  </>);
};

export default Sidebar;

