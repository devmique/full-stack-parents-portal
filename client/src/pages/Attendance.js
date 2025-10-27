import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Attendance.css'; 
import { useToast } from "../hooks/use-toast";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
const Attendance = () => {
 const { toast } = useToast();
  const today =new Date().toISOString().split("T")[0];
  const user = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem("token");
  const [onEdit, setOnEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5; // Number of records per page
  const [attendance, setAttendance] = useState([]);
  const [newRecord, setNewRecord] = useState({
    student_id: '',
    date: today,
    status: '',
  });
  const [editRecordId, setEditRecordId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

const fetchAttendance = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/attendance', {
      params: user.role === 'parent' ? { student_id: user.id } : {},
      headers: { Authorization: `Bearer ${token}` }
    });
    setAttendance(res.data);
  } catch (err) {
    console.error('Error fetching attendance:', err);
  }
};


  const handleAdd = async () => {
     if (!newRecord.student_id.trim()) {
    toast({ title: "Missing Field", description: "Student ID is required.", variant: "destructive" }); 
    return;
  }
  if (!newRecord.date) {
   toast({ title: "Missing Field", description: "DATE is required.", variant: "destructive" }); 
    return;
  }
  if (!newRecord.status) {
  toast({ title: "Missing Field", description: "STATUS is required.", variant: "destructive" }); 
    return;
  }


    const dayOfWeek = new Date(newRecord.date).toLocaleDateString('en-US', { weekday: 'long' });

    try {
      await axios.post('http://localhost:5000/api/attendance', {
        ...newRecord,
        day_of_week: dayOfWeek,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendance();
      setNewRecord({ student_id: '', date: today, status: '' });
      toast({ title: "Success", description: "Attendance record added successfully!" });
    } catch (err) {
      console.error('Add Error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`,{
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAttendance();
      toast({ title: "Deleted", description: "Attendance record deleted successfully." });
    } catch (err) {
      console.error('Delete Error:', err);
      toast({ title: "Error", description: "Failed to delete attendance record.", variant: "destructive" });
    }
  };

  const handleEdit = (record) => {
    setEditRecordId(record.id);
    setEditStatus(record.status);
    setOnEdit(true)
  };

  const handleUpdate = async (id) => {
    try {
      const student_id = user.id;
  
      await axios.put(`http://localhost:5000/api/attendance/${id}`, { status: editStatus, student_id },{
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditRecordId(null);
      setEditStatus('');
      setOnEdit(false);
      fetchAttendance();
      toast({ title: "Success", description: "Attendance record updated successfully!" });
    } catch (err) {
      console.error('Update Error:', err);
    }
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * recordsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - recordsPerPage;
  const currentRecords = attendance.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(attendance.length / recordsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <div className="attendance-container">
      <h2 className="attendance-title"><ChecklistOutlinedIcon className="pageIcon" fontSize='30px'/> Attendance</h2>

      {user.role === 'instructor' && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Student ID"
            value={newRecord.student_id}
            onChange={(e) => setNewRecord({ ...newRecord, student_id: e.target.value })}
          />
          <input
            type="date"
            value={newRecord.date}
            onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
          />
          <select 
            value={newRecord.status}
            onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </select>
          <button disabled={onEdit}className="btn btn-primary" onClick={handleAdd}>Add Record</button>
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            {user.role === 'instructor' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.student_id}</td>
              <td>{record.student_name}</td>
              <td>
                {new Date(record.date)
                  .toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })}
              </td>
              <td>{record.day_of_week}</td>
              <td>
                {editRecordId === record.id ? (
                  <select className='action-select'
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                  </select>
                ) : (
                  record.status
                )}
              </td>
              {user.role === 'instructor' && (
                <td>
                  {editRecordId === record.id ? (
                    <>
                      <div className="action-btns">
                      <button className="btn btn-save" onClick={() => handleUpdate(record.id)} style={{ marginRight: '5px', color: 'rgba(17, 81, 191, 0.872)' }}>Save</button>
                        <button className="btn btn-cancel" onClick={() => {setEditRecordId(null); setOnEdit(false);}} style={{ color: 'gray' }}>Cancel</button>
                        </div>
                    </>
                  ) : (
                      <>
                        <div className="action-btns">
                      <button className="btn btn-edit" onClick={() => handleEdit(record)} style={{ marginRight: '5px' }}>Edit</button>
                          <button  className="btn btn-delete" onClick={() => handleDelete(record.id)} style={{ color: 'red' }}>Delete</button>
                          </div>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Material UI Pagination */}
                <Stack spacing={2} alignItems={"center"} sx={{ marginTop: 2 }} >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
    </div>
  );
};

export default Attendance;
