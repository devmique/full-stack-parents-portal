import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Subjects.css"
const Subjects = () => {
   const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject_code: '', subject_title: '', term:'', units:'' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subject_code || !newSubject.subject_title || !newSubject.term || !newSubject.units) return;

    try {
      await axios.post('http://localhost:5000/api/subjects', newSubject);
      fetchSubjects();
      setNewSubject({ subject_code: '', subject_title: '', term: '', units: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="subject-container">
      <h2 className="subject-title">Subjects List</h2>

      {user.role === 'admin' && (
        <form onSubmit={handleAddSubject} className="subject-form">
          <input
            type="text"
            placeholder="Subject Code"
            value={newSubject.subject_code}
            onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Subject Title"
            value={newSubject.subject_title}
            onChange={(e) => setNewSubject({ ...newSubject, subject_title: e.target.value })}
            className="input-field"
          />
            <input
            type="text"
            placeholder="Term"
            value={newSubject.term}
            onChange={(e) => setNewSubject({ ...newSubject, term: e.target.value })}
            className="input-field"
          />
            <input
            type="text"
            placeholder="Units"
            value={newSubject.units}
            onChange={(e) => setNewSubject({ ...newSubject, units: e.target.value })}
            className="input-field"
          />
          <button type="submit" className="addsubj-button">
            Add Subject
          </button>
        </form>
      )}

      <table className="subject-table">
        <thead>
          <tr>
            <th>Subject Code</th>
            <th>Subject Title</th>
             <th>Term</th>
            <th>Units</th>
            {user.role === 'admin' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj) => (
            <tr key={subj.id}>
              <td>{subj.subject_code}</td>
              <td>{subj.subject_title}</td>
              <td>{subj.term}</td>
              <td>{subj.units}</td>
              {user.role === 'admin' && (
                <td>
                  <button
                    onClick={() => handleDelete(subj.id)}
                    className="deletesubj-button"
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
  );
};

export default Subjects;
