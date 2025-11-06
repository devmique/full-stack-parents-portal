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

// helper to fix ISO datetime format
function formatDate(dateStr) {
  return dateStr.replace('T', ' ').split('+')[0];
}

// Create event
router.post("/", authorizeRole("admin"), (req, res) => {
  const { subject_code, subject_title, professor, start, end, color, room } = req.body;
  
    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);

  db.query(
    "INSERT INTO schedule_events (user_id, subject_code, subject_title, professor, start, end, color, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, subject_code, subject_title, professor, formattedStart, formattedEnd, color, room],
    (err, result) => {
      if (err){
       return res.status(500).json({ error: "Database error" }); }
       // Get the admin’s name
    db.query("SELECT name FROM users WHERE id = ?", [req.user.id], (err, nameResult) => {
      if (err) return res.status(500).json({ error: "Failed to fetch admin name" });
  
      const adminName = nameResult[0]?.name || "Admin";
      res.json({ message: "Event added", id: result.insertId });
 
   // Create a general notification
      
    const message = `${adminName} added a new schedule.`;
    const type = 'general';

    db.query(
      "INSERT INTO notifications (message, type) VALUES (?, ?)",
      [message, type],
      (err2, notifResult) => {
        if (!err2) {
          const notifId = notifResult.insertId;
          // Link this notification to all 
          db.query(
            "INSERT INTO user_notifications (user_id, notification_id) SELECT id, ? FROM users WHERE role IN ('parent', 'instructor', 'admin')",
            [notifId],
            (linkError)=>{
              if(!linkError){
                const io = req.app.get("io");
                io.emit("newNotification", {
                  id: notifId, 
                  message,
                  type,
                  created_at: new Date(),
                read_status: 0 });
              }
            }
          );
        }
      }
    );
  });
    }
  );
});

// Drag / Resize update
router.put("/:id", authorizeRole("admin"), (req, res) => {
  const { start, end } = req.body;
 // Save as local datetime 
  const formattedStart = start.replace('T', ' ');
  const formattedEnd = end.replace('T', ' ');
  db.query(
    "UPDATE schedule_events SET start=?, end=? WHERE id=?",
    [formattedStart, formattedEnd, req.params.id],
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
