import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Schedule.css"
axios.defaults.headers.common["Authorization"] = `Bearer ${sessionStorage.getItem("token")}`;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const Schedule = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [schedule, setSchedule] = useState([]);
  const [newRow, setNewRow] = useState({
    time_slot: '',
    monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {},
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const safeParse = (str) => {
    try {
      return str ? JSON.parse(str) : {};
    } catch (err) {
      console.error("JSON parse error:", str, err);
      return {};
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/schedule');
      const formatted = res.data.map(row => ({
        ...row,
        monday: safeParse(row.monday),
        tuesday: safeParse(row.tuesday),
        wednesday: safeParse(row.wednesday),
        thursday: safeParse(row.thursday),
        friday: safeParse(row.friday),
        saturday: safeParse(row.saturday),
      }));
      setSchedule(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRow.time_slot.trim()) {
    alert("Time slot is required!");
    return;
  }


    try {
      await axios.post('http://localhost:5000/api/schedule', newRow);
      fetchSchedule();
      setNewRow({
        time_slot: '',
        monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {}, saturday: {}
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`);
      fetchSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellChange = (day, field, value) => {
    setNewRow(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">Class Schedule</h2>

      {user.role === 'admin' && (
        <form onSubmit={handleAdd} className="schedule-form">
          <div className='form-group'>
            <input
              type="text"
              placeholder="Time Slot (e.g. 8:00 AM - 12:00 PM)"
              value={newRow.time_slot}
              onChange={(e) => setNewRow({ ...newRow, time_slot: e.target.value })}
              className="form-input time-input"
            />
          </div>

          <div className="day-grid">
            {days.map(day => (
              <div className="day-column" key={day}>
                <label className="day-label">{day}</label>
                <input
                  type="text"
                  placeholder="Subject Code"
                  className="form-input"
                  onChange={(e) => handleCellChange(day, 'subject_code', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Subject Title"
                  className="form-input"
                  onChange={(e) => handleCellChange(day, 'subject_title', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Professor"
                  className="form-input"
                  onChange={(e) => handleCellChange(day, 'professor', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button type="submit" className="add-button">
            Add Row
          </button>
        </form>
      )}
       <div className="schedule-table-wrapper">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => (
              <th key={day} className="capitalize">{day}</th>
            ))}
            {user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.id}>
              <td>{row.time_slot}</td>
              {days.map(day => (
                <td key={day}>
                  <div className="cell-code">{row[day]?.subject_code || ''}</div>
                  <div>{row[day]?.subject_title || ''}</div>
                  <div className="cell-professor">{row[day]?.professor || ''}</div>
                </td>
              ))}
              {user.role === 'admin' && (
                <td>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
       </div>
    </div>
  );
};

export default Schedule;
