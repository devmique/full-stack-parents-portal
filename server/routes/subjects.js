const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');
// Get all subjects
router.get('/', (req, res) => {
  db.query("SELECT * FROM subjects", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new subject
router.post('/', authorizeRole("admin"),(req, res) => {
  const { subject_code, subject_title, term, units } = req.body;
 
  const sql = "INSERT INTO subjects (subject_code, subject_title, term, units) VALUES (?, ?, ?,?)";
  db.query(sql, [subject_code, subject_title, term, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

     const userId = req.user.id; 
     // Get the admin’s name
    db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
      if (err) return res.status(500).json({ error: "Failed to fetch admin name" });
  
      const adminName = nameResult[0]?.name || "Admin";
    res.json({ message: "Subject added successfully", id: result.insertId });
 
   // Create a general notification
       const timestamp = new Date().toLocaleString();
    const message = `${adminName} added a new subject: ${subject_title} (${subject_code}). ${timestamp}`;
    const type = 'general';

    db.query(
      "INSERT INTO notifications (message, type) VALUES (?, ?)",
      [message, type],
      (err2, notifResult) => {
        if (!err2) {
          const notifId = notifResult.insertId;
          // Link this notification to all parents
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
})
});

// Delete a subject
router.delete('/:id', authorizeRole("admin"),(req, res) => {
  
  const id = req.params.id;
  db.query("DELETE FROM subjects WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Subject deleted successfully" });
  });
});

module.exports = router;
