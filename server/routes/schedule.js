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

      const userId = req.user.id; 
   // Get the admin’s name
  db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch admin name" });

    const adminName = nameResult[0]?.name || "Admin";
      // ✅ Create notification
          const timestamp = new Date().toLocaleString();
      const message = `${adminName} added a new schedule. ${timestamp}`;
      const type = 'general';

      db.query(
        "INSERT INTO notifications (message, type) VALUES (?, ?)",
        [message, type],
        (err2, notifResult) => {
          if (!err2) {
            const notifId = notifResult.insertId;
            // Link notification to all parents (so each has individual read tracking)
            db.query(
              "INSERT INTO user_notifications (user_id, notification_id) SELECT id, ? FROM users WHERE role IN ('parent', 'instructor', 'admin')",
              [notifId],
               (linkError) => {
                if (!linkError) {
                  const io = req.app.get("io");

                  // ✅ Emit new notification to all clients
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
        }
      );
      }
  );
      res.json({ message: "Schedule added successfully", id: result.insertId });
   
})
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
