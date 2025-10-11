import React,{useEffect} from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { Outlet, useNavigate, useLocation  } from "react-router-dom"; // Allows nested routes to render
import "../styles/Dashboard.css";
   

const Dashboard = () => {
 const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user"));


  useEffect(() => {
    // Redirect only if user is at /dashboard root
    if (location.pathname === "/dashboard") {
      if (user?.role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (user?.role === "parent") {
        navigate("/dashboard/parent", { replace: true });
      } else if(user?.role === "instructor"){
       navigate("/dashboard/instructor", { replace: true });
      }
    }
  }, [location.pathname, user, navigate]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <DashboardHeader />
      
        
        <DashboardContent />
      <Outlet /> 
      </div>
    </div>
  );
};

export default Dashboard;

