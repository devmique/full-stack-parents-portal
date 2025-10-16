const express = require('express');
const router = express.Router();
const db = require("../db");
const { authorizeRole } = require('../middleware/authMiddleware');

// Get all announcements
router.get('/', (req, res) => {
  db.query('SELECT * FROM announcements ORDER BY date_posted DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Create new announcement (admin only)
router.post('/', authorizeRole("admin"), (req, res) => {
  const { title, content } = req.body;
    if (!title || !content ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    'INSERT INTO announcements (title, content) VALUES (?, ?)',
    [title, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error creating announcement' });
       
           //Create a general notification
      const timestamp = new Date().toLocaleString();
      const message = `Admin posted a new announcement: ${title}. ${timestamp}`;
      const type = 'general';
     
      db.query(
        "INSERT INTO notifications (message, type) VALUES (?, ?)",
        [message, type],
        (err2, notifResult) => {
          if (!err2) {
            const notifId = notifResult.insertId;

            // Link this notification to all parents
            db.query(
              "INSERT INTO user_notifications (user_id, notification_id) SELECT id, ? FROM users ",
              [notifId]
            );
          }
        }
      );

      res.json({ message: 'Announcement created successfully' });
    }
  );
});
// Delete announcement by ID (admin only)
router.delete('/:id',authorizeRole("admin"), (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM announcements WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error deleting announcement' });
    res.json({ message: 'Announcement deleted successfully' });
  });
});


module.exports = router;
