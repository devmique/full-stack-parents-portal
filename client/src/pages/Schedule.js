import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios"
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import '../styles/Schedule.css'; 
import { useToast } from "../hooks/use-toast";
const Schedule = () => {
  const { toast } = useToast();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [events, setEvents] = useState([]);


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get("http://localhost:5000/api/schedule", {
      headers: { Authorization: `Bearer ${token}` },
    });
     // Map DB events to FullCalendar format
  const fcEvents = res.data.map(ev => ({
    id: ev.id,
    title: `${ev.subject_code} - ${ev.subject_title} (${ev.professor}) ${ev.room}`,
  start: new Date(ev.start), // ensure JS Date object
  end: new Date(ev.end),
    color: ev.color,
    extendedProps: {
      room: ev.room,
      subject_code: ev.subject_code,
      professor: ev.professor,
    },
  }));
  setEvents(fcEvents);

  };

  const handleDateSelect = async (selectInfo) => {
  if (user.role !== "admin") return;

  const subject_code = prompt("Subject Code:");
  if (!subject_code) {
    toast({
      title: "Missing Field",
      description: "Please provide a Subject Code.",
      variant: "destructive",
    });
    return;
  }

  const subject_title = prompt("Subject Title:");
  const professor = prompt("Professor:");
  const room = prompt("Room:");
  if (!subject_title || !professor || !room) {
    toast({
      title: "Missing Field",
      description: "All fields are required.",
      variant: "destructive",
    });
    return;
  }
  const newEvent = {
    subject_code,
    subject_title,
    professor,
    start: selectInfo.startStr,
    end: selectInfo.endStr,
    color: generateColor(subject_code),
    room
  };


  try {
    await axios.post("http://localhost:5000/api/schedule", newEvent, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchEvents();
    toast({
      title: "Success",
      description: "Schedule event created.",
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to add schedule event.",
      variant: "destructive",
    });
  }
};


  const handleEventDrop = async (changeInfo) => {
  if (user.role !== "admin") return;

  const eventId = changeInfo.event.id; // should match DB row ID
  const formatLocalDateTime = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

  try {
    await axios.put(
      `http://localhost:5000/api/schedule/${eventId}`,
      {

         start: formatLocalDateTime(changeInfo.event.start),
        end: formatLocalDateTime(changeInfo.event.end),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // update the state directly
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, start: changeInfo.event.start, end: changeInfo.event.end }
          : ev
      )
    );

    toast({ title: "Updated", description: "Schedule event moved/updated." });
  } catch (error) {
    console.error(error);
    toast({ title: "Error", description: "Failed to update event.", variant: "destructive" });
  }
};



  const handleDelete = async (clickInfo) => {
  if (user.role !== "admin") return;

  if (!window.confirm("Delete this class?")) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/schedule/${clickInfo.event.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchEvents();
    toast({
      title: "Deleted",
      description: "Schedule event removed.",
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete event.",
      variant: "destructive",
    });
  }
};

  const generateColor = (code) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  };

  return (
    <div className="schedule-wrapper">
      <h2 className="schedule-title"><EventNoteOutlinedIcon className="pageIcon" fontSize='30px'/> Term Schedule</h2>
      <FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  timeZone="local"
  initialDate="2025-01-01" // fixed week start
  validRange={{
    start: "2025-01-05",
    end: "2025-01-12",
  }}

  headerToolbar={{
    left: "",           // no prev
    center: "",    // no title
    right: "",          // no next
  }}

  allDaySlot={false}
  weekends={true}
  selectable={user.role === "admin"}
  editable={user.role === "admin"}

  events={events}
  select={handleDateSelect}
  eventDrop={handleEventDrop}
  eventResize={handleEventDrop}
  eventClick={handleDelete}

  height="80vh"
  slotMinTime="07:00:00"
  slotMaxTime="19:00:00"
/>

    </div>
  );
};

export default Schedule; 
