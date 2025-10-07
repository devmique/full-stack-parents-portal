const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');
// Get all grades
router.get('/', (req, res) => {
  const studentId = req.query.student_id; 

  const query = studentId
    ? `SELECT grades.*, students.name AS student_name 
       FROM grades 
       JOIN students ON grades.student_id = students.id 
       WHERE grades.student_id = ?`
    : `SELECT grades.*, students.name AS student_name 
       FROM grades 
       JOIN students ON grades.student_id = students.id`;

  db.query(query, studentId ? [studentId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new grade
router.post('/',authorizeRole("admin"),(req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;

  if (!student_id || !school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO grades (student_id, school_year, term, subject_code, subject_title, grade, units)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, school_year, term, subject_code, subject_title, grade, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const message = `Admin added a new grade: ${subject_title}`;
   db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [student_id, message]);


    res.json({ message: "Grade added successfully", id: result.insertId });
  });
});

// Update an existing grade
router.put('/:id',authorizeRole("admin"), (req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;
  const gradeId = req.params.id;

  if (!school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE grades 
    SET school_year = ?, term = ?, subject_code = ?, subject_title = ?, grade = ?, units = ?
    WHERE id = ?`;

  db.query(sql, [school_year, term, subject_code, subject_title, grade, units, gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const message = `Admin updated a grade: ${subject_title}`;
db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [student_id, message]);


    res.json({ message: "Grade updated successfully" });
  });
});

// Delete a grade
router.delete('/:id', authorizeRole("admin"),(req, res) => {
  const gradeId = req.params.id;

  db.query("DELETE FROM grades WHERE id = ?", [gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Grade deleted successfully" });
  });
});

module.exports = router;
