import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import "../styles/Events.css";
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
const Events = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage =5; // Number of events per page

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/calendar", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

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

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="events-container">
      <h2><CalendarTodayOutlinedIcon className="pageIcon" fontSize='30px'/> School Agenda</h2>

      {events.length === 0 ? (
        <p style={{ fontSize: "20px" }}>No events listed.</p>
      ) : (
        <>
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.start).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Material UI Pagination */}
          <Stack spacing={2} sx={{ marginTop: 2 }} >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </>
      )}
    </div>
  );
};

export default Events;
