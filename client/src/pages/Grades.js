import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import "../styles/Grades.css"
const Grades = () => {
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
    axios
      .get('http://localhost:5000/api/grades', {
        params: user.role !== 'admin' ? { student_id: user.id } : {},
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setGrades(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleAdd = () => {
  if (!newGrade.student_id.trim()) {
    alert("Student ID is required");
    return;
  }
  if (!newGrade.school_year.trim()) {
    alert("School Year is required");
    return;
  }
  if (!newGrade.term.trim()) {
    alert("Term is required");
    return;
  }
  if (!newGrade.subject_code.trim()) {
    alert("Subject Code is required");
    return;
  }
  if (!newGrade.subject_title.trim()) {
    alert("Subject Title is required");
    return;
  }
  if (!newGrade.grade.trim()) {
    alert("Grade is required");
    return;
  }
  if (!newGrade.units.trim()) {
    alert("Units are required");
    return;
  }

    axios
      .post('http://localhost:5000/api/grades', newGrade,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchGrades();
        setNewGrade({
          student_id: '',
          school_year: '',
          term: '',
          subject_code: '',
          subject_title: '',
          grade: '',
          units: ''
        });
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
        })
        .catch(err => console.error(err));
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/grades/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchGrades())
      .catch(err => console.error(err));
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

  return (
    <div className="grades-container">
      <h2>Grades</h2>

      <button onClick={exportToPDF} className="export-btn">
        <PictureAsPdfOutlinedIcon/>
        Export to PDF
      </button>

      {user.role === 'admin' && (
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
            {user.role === 'admin' && <th>Action</th>}
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
              {user.role === 'admin' && (
                <td>
                  <div className='action-buttons'>
                  <button onClick={() => handleEdit(g)}>Edit</button>
                  <button onClick={() => handleDelete(g.id)}>Delete</button>
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
