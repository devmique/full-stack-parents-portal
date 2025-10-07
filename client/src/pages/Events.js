
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Events.css"
axios.defaults.headers.common["Authorization"] = `Bearer ${sessionStorage.getItem("token")}`;
const Events = () => {
const [events, setEvents] = useState([]);

   useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/calendar",{
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      }

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

  return (
    <div className="events-container">
      <h2>Agenda</h2>
      {events.length === 0 ? (
        <p style={{fontSize: "20px"}}>No events listed.</p>
      ) : (

            <table className="events-table">
        <thead>
          <tr>
            <th>Event Title</th>
            <th>Date</th>
        
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id}>
              <td>{event.title} </td> <td>{new Date(event.start).toLocaleDateString()}</td>
            </tr>
          ))}
            </tbody>
            </table>

      )}
    </div>
  );
};

export default Events;
