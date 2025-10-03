const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all subjects
router.get('/', (req, res) => {
  db.query("SELECT * FROM subjects", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new subject
router.post('/', (req, res) => {
  const { subject_code, subject_title, term, units } = req.body;
  const sql = "INSERT INTO subjects (subject_code, subject_title, term, units) VALUES (?, ?, ?,?)";
  db.query(sql, [subject_code, subject_title, term, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Subject added successfully", id: result.insertId });
   const type = 'general'
  // Add notification
    const message = ` Admin added a new subject: ${subject_title} (${subject_code})`;
    db.query("INSERT INTO notifications (message, type) VALUES (?,?)", [message, type]);

  });
  
});

// Delete a subject
router.delete('/:id', (req, res) => {
  
  const id = req.params.id;
  db.query("DELETE FROM subjects WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Subject deleted successfully" });
  });
});

module.exports = router;
