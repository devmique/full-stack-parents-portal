const express = require('express');
const router = express.Router();
const db = require('../db');

// Get latest notifications
router.get('/', (req, res) => {
  const { user_id } = req.query;
 if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }
   const query = `
    SELECT n.id, n.message, n.type, n.created_at,
           COALESCE(un.read_status, 0) AS read_status
    FROM notifications n
    LEFT JOIN user_notifications un
      ON n.id = un.notification_id AND un.user_id = ?
    WHERE n.type = 'general' OR n.id IN (
      SELECT notification_id FROM user_notifications WHERE user_id = ?
    )
    ORDER BY n.created_at DESC
  `;
   
    

    db.query(query, [user_id, user_id], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


// MARK all notifications as read for a user
router.put('/mark-all-read', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId in request body." });
  }
  const query = `
    UPDATE user_notifications 
    SET read_status = 1, read_at = NOW()
    WHERE user_id = ?
  `;  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error updating notification read status:", err);
      return res.status(500).json({ message: "Server error" });
    }
 
    res.sendStatus(200);
  });
});
module.exports = router;
