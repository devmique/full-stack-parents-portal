const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');
// Get full schedule
router.get('/', (req, res) => {
  db.query("SELECT * FROM schedule", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new schedule row
router.post('/', authorizeRole("admin"),(req, res) => {
  const { time_slot, monday, tuesday, wednesday, thursday, friday, saturday } = req.body;

  const sql = `
    INSERT INTO schedule (time_slot, monday, tuesday, wednesday, thursday, friday, saturday)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      time_slot,
      JSON.stringify(monday),
      JSON.stringify(tuesday),
      JSON.stringify(wednesday),
      JSON.stringify(thursday),
      JSON.stringify(friday),
      JSON.stringify(saturday)
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      // Add notification
       const type = 'general'
    const message = ` Admin added a new schedule`;
    db.query("INSERT INTO notifications (message, type) VALUES (?,?)", [message, type]);

      res.json({ message: "Schedule added successfully", id: result.insertId });
    }
  );
});

// Delete a schedule row
router.delete('/:id', authorizeRole("admin"),(req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM schedule WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Schedule deleted successfully" });
  });
});

module.exports = router;
