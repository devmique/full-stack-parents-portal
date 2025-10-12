import React, { useState, useEffect } from 'react'
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import "../styles/Settings.css";
const Settings = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
//  Load user from sessionStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({ name: "Unknown", role: "Unknown", profilePic: "/default-profile.png" });
    }
  }, []);


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

    //  Delete Account Function
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Account Deleted", description: "Your account has been deleted successfully." });
        sessionStorage.clear();
        navigate("/");
      } else {
      toast({
        title: "Error",
        description: data.message || "Failed to delete account.",
        variant: "destructive",
      });
    }
    } catch (error) {
      toast({ title: "Error", description: "There was an error deleting your account. Please try again later.", variant: "destructive" });
    }
  };
    return (
        <>
           
        <div className='settingsHeader'>
         
        <button onClick={goBackToDashboard} className="back-btn"><ArrowBackOutlinedIcon className="clearIcon" /></button>
         <p style={{ fontSize:"23px", color: "rgb(49, 49, 49)", margin:"5px 0 10px 0", padding:"0 0 0 10px"}}>Settings</p>
       
        </div>
            <div className='settingsContainer'>
      <p className="delete"onClick={handleDeleteAccount}>
            Delete my account
              </p>
              </div>
            </>
           
  )
}

export default Settings
