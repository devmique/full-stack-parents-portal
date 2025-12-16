import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from "../hooks/use-toast";
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import "../styles/Grades.css"
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CloseIcon from '@mui/icons-material/Close';
const Grades = () => {
    const { toast } = useToast(); 
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [grades, setGrades] = useState([]);
  const [newGrade, setNewGrade] = useState({
    student_id: '',
    school_year: '',
    term: '',
    subject_code: '',
    subject_title: '',
    grade: '',
    units: ''
  });
  const [editGrade, setEditGrade] = useState(null); 

const fetchGrades = () => {
  axios.get(
    'http://localhost:5000/api/grades',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  .then(res => setGrades(res.data))
  .catch(err => console.error(err));
};


  useEffect(() => {
    fetchGrades();
  }, []);

  const handleAdd = () => {
    const requiredFields = [
      "student_id",
      "school_year",
      "term",
      "subject_code",
      "subject_title",
      "grade",
      "units",
    ];

    for (const field of requiredFields) {
      if (!newGrade[field].trim()) {
        toast({
          title: "Missing Field",
          description: `${field.replace("_", " ").toUpperCase()} is required.`,
          variant: "destructive", // red error style
        });
        return;
      }
    }

    axios
      .post('http://localhost:5000/api/grades', newGrade,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchGrades();
        setNewGrade({
         ...newGrade,
          school_year: '',
          term: '',
          subject_code: '',
          subject_title: '',
          grade: '',
          units: ''
        });
        toast({ title: "Success", description: "Grade added successfully!" });
      })
      .catch(err => console.error(err));
  };

  const handleEdit = (grade) => {
    setEditGrade(grade);
    setNewGrade({
      student_id: grade.student_id,
      school_year: grade.school_year,
      term: grade.term,
      subject_code: grade.subject_code,
      subject_title: grade.subject_title,
      grade: grade.grade,
      units: grade.units
    });
  };

  const handleUpdate = () => {
 
    if (editGrade) {
      axios
        .put(`http://localhost:5000/api/grades/${editGrade.id}`, newGrade,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          fetchGrades();
          setEditGrade(null);
          setNewGrade({
            student_id: '',
            school_year: '',
            term: '',
            subject_code: '',
            subject_title: '',
            grade: '',
            units: ''
          });
          toast({ title: "Success", description: "Grade updated successfully!" });
        })
        .catch(err => console.error(err));
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/grades/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() =>{ fetchGrades();
        toast({ title: "Deleted", description: "Grade deleted successfully." });
      })
      .catch(err =>{ console.error(err)
        toast({ title: "Error", description: "Failed to delete grade.", variant: "destructive" });
      });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Grades", 14, 10);
    const tableColumn = ["Student ID", "Student Name", "School Year", "Term", "Subject Code", "Subject Title", "Grade", "Units"];
    const tableRows = grades.map(grade => ([
      grade.student_id,
      grade.student_name,
      grade.school_year,
      grade.term,
      grade.subject_code,
      grade.subject_title,
      grade.grade,
      grade.units
    ]));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("grades.pdf");
  };


  const updateStatus = (id, newStatus) => {
  axios.put(`http://localhost:5000/api/grades/status/${id}`,
    { status: newStatus },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  .then(() => {
    fetchGrades();
    toast({
      title: "Grade Updated",
      description: `Grade was ${newStatus}!`
    });
  })
  .catch(err => console.error(err));
};

  return (
    <div className="grades-container">
      <h2><SchoolOutlinedIcon className="pageIcon" fontSize='30px'/> Grades</h2>
     {user.role === 'parent' && (
       <button onClick={exportToPDF} className="export-btn">
        <PictureAsPdfOutlinedIcon/>
        Export to PDF
      </button>
     )}
     

      {user.role === 'instructor' && (
        <div className="grade-form">
            <div className="grades-form-grid">
          {["student_id", "school_year", "term", "subject_code", "subject_title", "grade", "units"].map(field => (
            <div key={field}>
              <input
                placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={newGrade[field]}
                onChange={(e) => setNewGrade({ ...newGrade, [field]: e.target.value })}
              />
            </div>
            
          ))}
            </div>
          {editGrade ? (
            <button onClick={handleUpdate}>Update Grade</button>
          ) : (
            <button onClick={handleAdd}>Add Grade</button>
          )}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student name</th>
            <th>School Year</th>
            <th>Term</th>
            <th>Subject Code</th>
            <th>Subject Title</th>
            <th>Grade</th>
            <th>Units</th>
            {user.role === 'instructor' && <th>Action</th>}
            {(user.role === 'admin' || user.role === 'instructor') && (
              <th>Status</th>
            )}
            {user.role === 'admin' && <th>Approval</th>}
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id}>
              <td>{g.student_id}</td>
              <td>{g.student_name}</td>
              <td>{g.school_year}</td>
              <td>{g.term}</td>
              <td>{g.subject_code}</td>
              <td>{g.subject_title}</td>
              <td>{g.grade}</td>
              <td>{g.units}</td>
             

              {user.role === 'instructor' && (
                <td>
                  <div className='action-buttons'>
                  <button onClick={() => handleEdit(g)}>Edit</button>
                  <button onClick={() => handleDelete(g.id)}>Delete</button>
               </div>
                </td>
              )}
               {(user.role === 'admin' || user.role === 'instructor') && (
               <td>
              <span className={
                g.status === 'approved' ? 'stat-text status-approved' :
                g.status === 'declined' ? 'stat-text status-declined' : 'stat-text status-pending'
              }> 
               {g.status === "approved" && (
                <CheckCircleIcon style={{  fontSize: 15, marginRight: 5 }} />
              )}

              {g.status === "declined" && (
                <CancelIcon style={{  fontSize: 15, marginRight: 5 }} />
              )}
              
              {g.status === "pending" && (              
                 <AccessTimeFilledIcon style={{ fontSize: 15, marginRight: 5 }} />
              )}
              {g.status}
              </span>
            </td>
            )}
            {user.role === 'admin'  && g.status === 'pending' && (
           <td>
             <div className='status-buttons'>
              <button className='stat-btn' onClick={() => updateStatus(g.id, 'approved')}><CheckIcon style={ {fontSize: "13px", marginRight: "5px"}}/>Approve</button>
             <button  className='stat-btn' onClick={() => updateStatus(g.id, 'declined')}><CloseIcon style={ {fontSize: "13px", marginRight: "5px"}}/>Decline</button>
             </div>
           </td>
          )}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grades;
