import React, { useState } from "react";
import axios from "axios";
import "../styles/Help.css"; 
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
axios.defaults.headers.common["Authorization"] = `Bearer ${sessionStorage.getItem("token")}`;
const Help = () => {
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
   const navigate = useNavigate();
    
     const goBackToDashboard = () => {
    
        if (user?.role === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/parent");
    }
  };
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const userName = user.name || "Unknown";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issue.trim()) {
      setMessage("Please describe your issue.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/help", { userName, issue });

      if (response.data.success) {
        setMessage("Your issue has been submitted successfully.");
        setMessageType("success");
        setIssue(""); // Clear textarea
      } else {
        setMessage("Failed to submit your issue. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error submitting issue.");
       setMessageType("error");
    }
  };

  return (
<>
       <div className='help-header'>
         
        <button onClick={goBackToDashboard} className="back-btn"><ArrowBackOutlinedIcon className="clearIcon" /></button>
         <p style={{ fontSize:"23px", color: "rgb(49, 49, 49)", margin:"5px 0 10px 0", padding:"0 0 0 10px"}}>Help & Support</p>
       
        </div>
    <div className="help-container">
      <p style={{fontSize:"27px", margin:"0 0 30px  0"}}>How can we help?</p>
      <p>If you're experiencing any issues, please describe them below.</p>

      <form className="submit-form" onSubmit={handleSubmit}>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Describe your issue..."
          required
        ></textarea>
        <button type="submit">Submit</button>
      </form>

        {message && <p style={ { color:messageType==="success"?"#39e75f": "#e23636"}} className="message">{message}</p>}
          </div>
          </>
  );
};

export default Help;
