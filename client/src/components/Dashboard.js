import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import { Outlet } from "react-router-dom"; // Allows nested routes to render
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
   

const Dashboard = () => {

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

