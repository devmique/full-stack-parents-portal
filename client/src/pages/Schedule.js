import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import TimeGrid from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useToast } from "../hooks/use-toast";
const Schedule = () => {
  const { toast } = useToast();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [events, setEvents] = useState([]);
  const calendarRef = useRef();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get("http://localhost:5000/api/schedule", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEvents(res.data);
  };

  const handleDateSelect = async (selectInfo) => {
    if (user.role !== "admin") return;

    const subject_code = prompt("Subject Code:");
    if (!subject_code) return;

    const newEvent = {
      subject_code,
      subject_title: prompt("Subject Title:"),
      professor: prompt("Professor:"),
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      color: generateColor(subject_code),
    };

    await axios.post("http://localhost:5000/api/schedule", newEvent, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchEvents();
  };

  const handleEventDrop = async (changeInfo) => {
    if (user.role !== "admin") return;

    await axios.put(
      `http://localhost:5000/api/schedule/${changeInfo.event.id}`,
      {
        start: changeInfo.event.start,
        end: changeInfo.event.end,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchEvents();
  };

  const handleDelete = async (clickInfo) => {
    if (user.role !== "admin") return;

    if (!window.confirm("Delete this class?")) return;

    await axios.delete(`http://localhost:5000/api/schedule/${clickInfo.event.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchEvents();
  };

  const generateColor = (code) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 80%)`;
  };

  return (
    <div className="schedule-wrapper">
      <FullCalendar
        plugins={[TimeGrid, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={user.role === "admin"}
        editable={user.role === "admin"}
        events={events}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        eventClick={handleDelete}
        allDaySlot={false}
        height="80vh"
      />
    </div>
  );
};

export default Schedule; 
