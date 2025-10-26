import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Chatbot from './Chatbot.js'
import '../styles/Calendar.css'
import { useToast } from "../hooks/use-toast";
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Cards from "./Cards";
const CalendarPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
   //Generate a random pastel color
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };
 useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar",
        {
         headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }}
      );
      setEvents(
        res.data.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: "transparent",
        }))
      );
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };
  fetchEvents();
}, []);


  const handleDateClick = async (arg) => {
    if (user?.role  !== "admin") return;
    const title = prompt("Enter event title:");
    if (!title) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/calendar",
        { title,start: arg.dateStr },
        {
         headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }}
      );

      setEvents((prev) => [
        ...prev,
        {
          id: res.data.id,
          title,
          start: arg.dateStr,
          end: arg.dateStr,
          backgroundColor: "transparent",
        },
      ]);
      toast({ title: "Success", description: "Event added successfully!" });
    } catch (err) {
      
      console.error("Error adding event", err);
      toast({ title: "Error", description: "Failed to add event.", variant: "destructive" });
    }
  };

  const handleEventClick = async (info) => {
  if (user.role !== "admin") return;
  if (!window.confirm(`Delete event "${info.event.title}"?`)) return;

  try {
    await axios.delete(`http://localhost:5000/api/calendar/${info.event.id}`
    ,{
         headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }}
    );

    // Remove it from calendar UI immediately
    info.event.remove(); 

    // And also update state just in case
    setEvents((prev) => prev.filter((e) => e.id !== info.event.id));
    toast({ title: "Deleted", description: "Event deleted successfully." });
  } catch (err) {
    console.error("Error deleting event", err);
    toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
  }
};

  

  
  return (
    <div>
      {/* ✅ Cards Section */}
        <Cards/>
       <div className="calendar-container">
       <div className="calendar-header">
       
          <div className ="calendar-card">
       <h2> <CalendarMonthOutlinedIcon className="pageIcon" fontSize='30px'/> School Calendar</h2>

      <FullCalendar 
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        displayEventTime={false}
        eventDidMount={(info) => {
        info.el.style.backgroundColor = getRandomPastelColor();
        info.el.style.borderColor = "transparent";
        info.el.style.color = "#333";
      }}
            />
          </div>
          </div>
         </div>
         <Chatbot user={user} />
    </div>
  );
};

export default CalendarPage;
