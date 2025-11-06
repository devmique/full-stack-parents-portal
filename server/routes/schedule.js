const express = require("express");
const router = express.Router();
const db = require("../db");
const { authorizeRole } = require("../middleware/authMiddleware");

// Get all events
router.get("/", (req, res) => {
  db.query("SELECT * FROM schedule_events", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Create event
router.post("/", authorizeRole("admin"), (req, res) => {
  const { subject_code, subject_title, professor, start, end, color } = req.body;
  
  db.query(
    "INSERT INTO schedule_events (user_id, subject_code, subject_title, professor, start, end, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, subject_code, subject_title, professor, start, end, color],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Event added", id: result.insertId });
    }
  );
});

// Drag / Resize update
router.put("/:id", authorizeRole("admin"), (req, res) => {
  const { start, end } = req.body;

  db.query(
    "UPDATE schedule_events SET start=?, end=? WHERE id=?",
    [start, end, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Event updated" });
    }
  );
});

// Delete event
router.delete("/:id", authorizeRole("admin"), (req, res) => {
  db.query("DELETE FROM schedule_events WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Event deleted" });
  });
});

module.exports = router;
