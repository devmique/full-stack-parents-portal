import React, { useState } from "react";
import { useToast } from "../hooks/use-toast";
import axios from "axios";
import "../styles/Help.css"; 
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
const Help = () => {
  const { toast } = useToast();
  const [issue, setIssue] = useState("");
   const navigate = useNavigate();
    
    
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const userName = user.name || "Unknown";
  
  const goBackToDashboard = () => {
    
        if (user?.role === "admin") {
      navigate("/dashboard/admin");
    }
    else if( user?.role==="instructor"){
      navigate("/dashboard/instructor");
    } else {
      navigate("/dashboard/parent");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issue.trim()) {
      toast({ title: "Missing Field", description: "Please describe your issue before submitting.", variant: "destructive" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/help", { userName, issue },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        toast({ title: "Success", description: "Your issue has been submitted." });
        setIssue(""); // Clear textarea
      } 
    } catch (error) {
     toast({ title: "Error", description: "There was an error submitting your issue. Please try again later.", variant: "destructive" });
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
          </div>
          </>
  );
};

export default Help;
