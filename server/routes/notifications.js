const express = require('express');
const router = express.Router();
const db = require('../db');

// Get latest notifications
router.get('/', (req, res) => {
  const { student_id } = req.query;

  const query = student_id
    ? `SELECT * FROM notifications WHERE user_id = ? OR type = 'general' ORDER BY created_at ASC`
    : `SELECT * FROM notifications ORDER BY created_at ASC`;

  db.query(query, student_id ? [student_id] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});


// MARK all notifications as read for a user
router.put('/mark-all-read', (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ message: "Missing StudentId in request body." });
  }
  const type = 'general';
  const updateQuery = `UPDATE notifications SET read_status = 1 WHERE user_id = ? OR type = ?`;
  db.query(updateQuery, [studentId, type], (err, result) => {
    if (err) {
      console.error("Error updating notification read status:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.sendStatus(200);
  });
});
module.exports = router;
