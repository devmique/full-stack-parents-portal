import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Events from "../pages/Events"
import '../styles/Calendar.css'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

const CalendarPage = () => {
  const [studentlist, setStudentList] = useState(null);
  const [subjectlist, setSubjectList] = useState(null);
  const [events, setEvents] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const token = sessionStorage.getItem("token");

 useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Events:", res.data); 
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
        { headers: { Authorization: `Bearer ${token}` } }
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
    } catch (err) {
      console.error("Error adding event", err);
    }
  };

  const handleEventClick = async (info) => {
  if (user.role !== "admin") return;
  if (!window.confirm(`Delete event "${info.event.title}"?`)) return;

  try {
    await axios.delete(`http://localhost:5000/api/calendar/${info.event.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Remove it from calendar UI immediately
    info.event.remove(); 

    // And also update state just in case
    setEvents((prev) => prev.filter((e) => e.id !== info.event.id));
  } catch (err) {
    console.error("Error deleting event", err);
  }
};

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/studentlist');
        setStudentList(res.data);
      } catch (err) {
        console.error('Error fetching student list:', err);
      }
    };
    fetchStudents();
  }, [])
  

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/subjectlist');
        setSubjectList(res.data);
      } catch (err) {
        console.error('Error fetching subject list:', err);
      }
    }
    fetchSubjects()
    }, [])

  
  return (
    <div>
      <div className="list-container">
     {studentlist && (
       
        <div className="list-card studentlist-card">
          <PeopleAltOutlinedIcon style={{color:"#ccc", fontSize:"30px"}}/>
          <h2>Students</h2>
            <h1>{studentlist.count}</h1>
            </div>
       
      )}

      {subjectlist && (
     
        <div className="list-card subjectlist-card">
          <ListAltOutlinedIcon style={{color:"#ccc",fontSize:"30px"}}/>
          <h2>Subjects</h2>
            <h1>{subjectlist.count}</h1>
            </div>
        
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
            />
          </div>
          </div>
          <Events/>
        
         </div>
    </div>
  );
};

export default CalendarPage;
