import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import '../styles/Calendar.css'
import { useToast } from "../hooks/use-toast";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

const CalendarPage = () => {
  const { toast } = useToast();
  const [studentlist, setStudentList] = useState(null);
  const [subjectlist, setSubjectList] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [events, setEvents] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user")) || {};

 useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar",{
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

    // ✅ Fetch student and subject lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/studentlist", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/subjectlist", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
        ]);
        setStudentList(studentsRes.data);
        setSubjectList(subjectsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchData();
  }, [studentlist, subjectlist]);


  
  return (
    <div>
      {/* ✅ Cards Section */}
      <div className="list-container">
        {loadingCards ? (
          <>
            <CircularProgress />
            <CircularProgress />
           
          </>
        ) : (
          <>
            <div className="list-card studentlist-card">
              <PeopleAltOutlinedIcon style={{ color: "#93bbfa", fontSize: "30px" }} />
              <h2>Students</h2>
              <h1>{studentlist?.count || 0}</h1>
            </div>

            <div className="list-card subjectlist-card">
              <ListAltOutlinedIcon style={{ color: "#f5ffa7", fontSize: "30px" }} />
              <h2>Subjects</h2>
              <h1>{subjectlist?.count || 0}</h1>
            </div>
          </>
        )}
      </div>
       <div className="calendar-container">
       <div className="calendar-header">
        <h2>School Calendar</h2>
       
          <div className ="calendar-card">
      <FullCalendar 
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        displayEventTime={false}
            />
          </div>
          </div>
         </div>
    </div>
  );
};

export default CalendarPage;
