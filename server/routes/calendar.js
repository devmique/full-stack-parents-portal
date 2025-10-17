
const express = require('express');
const router = express.Router();
const db = require("../db");
const { authorizeRole } = require('../middleware/authMiddleware');

// GET events (admin and parent)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM calendar_events ORDER BY date ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch events" });

    const formatted = results.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
    }));

    res.json(formatted);
  });
});

// POST new event (admin only)`
router.post("/", authorizeRole("admin"),(req, res) => {
  const { title, start } = req.body;
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can add events" });
  if (!title || !start) return res.status(400).json({ error: "Title and start date required" });

  const date = new Date(start).toISOString().split('T')[0];
 
  const sql = "INSERT INTO calendar_events (title, date, created_by) VALUES (?, ?, ?)";
  db.query(sql, [title, date, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create event" });
    
     const userId = req.user.id; 
   // Get the admin’s name
  db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch admin name" });

    const adminName = nameResult[0]?.name || "Admin";
   // ✅ Step 1: Create a general notification entry
    const type = 'general';
    const timestamp = new Date().toLocaleString();
    const message = `${adminName} posted a new event: "${title}" on ${date}. ${timestamp}`;

    db.query("INSERT INTO notifications (message, type) VALUES (?, ?)", [message, type], (err2, notifResult) => {
      if (!err2) {
        const notifId = notifResult.insertId;

        //  Step 2: Assign notification to users
        db.query(
          "INSERT INTO user_notifications (user_id, notification_id) SELECT id, ? FROM users WHERE role IN ('parent', 'instructor', 'admin')",
          [notifId],
          (linkErr)=>{
               if (!linkErr) {
            const io = req.app.get("io");

            //  Emit real-time notification
            io.emit("newNotification", {
              id: notifId,
              message,
              type,
              created_at: new Date(),
              read_status: 0,
            });
          }
        
            }
        );
      }
    });
  });
    res.json({ id: result.insertId, title, date, message: "Event added successfully" });
  
  })
});


// DELETE event (admin only)
router.delete("/:id", authorizeRole("admin"), (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can delete events" });

  const sql = "DELETE FROM calendar_events WHERE id = ?";
  db.query(sql, [req.params.id], err => {
    if (err) return res.status(500).json({ error: "Failed to delete event" });
    res.json({ message: "Event deleted successfully" });
  });
});

module.exports = router;
